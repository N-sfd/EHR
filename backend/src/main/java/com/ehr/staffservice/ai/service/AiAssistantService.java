package com.ehr.staffservice.ai.service;

import com.ehr.staffservice.ai.dto.AiDtos;
import com.ehr.staffservice.ai.model.AiChatMessage;
import com.ehr.staffservice.ai.model.AiChatSession;
import com.ehr.staffservice.ai.model.AiFeedback;
import com.ehr.staffservice.ai.repository.AiChatMessageRepository;
import com.ehr.staffservice.ai.repository.AiChatSessionRepository;
import com.ehr.staffservice.ai.repository.AiFeedbackRepository;
import com.ehr.staffservice.dto.AiStreamChunk;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.metadata.Usage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executors;

@Service
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AiAssistantService.class);

    private static final String DISCLAIMER = "This assistant provides informational support and is not a substitute for a licensed clinician.";
    private static final int MAX_HISTORY_MESSAGES = 12;

    private final ChatClient chatClient;
    private final AiAuthorizationService authorizationService;
    private final AiGuardrailService guardrailService;
    private final AiPromptBuilder promptBuilder;
    private final AiRetrievalService retrievalService;
    private final AiHallucinationHeuristic hallucinationHeuristic;
    private final AiAuditService auditService;
    private final AiChatSessionRepository sessionRepository;
    private final AiChatMessageRepository messageRepository;
    private final AiFeedbackRepository feedbackRepository;
    private final ObjectMapper objectMapper;

    public AiAssistantService(ChatClient chatClient, AiAuthorizationService authorizationService,
                              AiGuardrailService guardrailService, AiPromptBuilder promptBuilder,
                              AiRetrievalService retrievalService, AiHallucinationHeuristic hallucinationHeuristic,
                              AiAuditService auditService,
                              AiChatSessionRepository sessionRepository, AiChatMessageRepository messageRepository,
                              AiFeedbackRepository feedbackRepository, ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.authorizationService = authorizationService;
        this.guardrailService = guardrailService;
        this.promptBuilder = promptBuilder;
        this.retrievalService = retrievalService;
        this.hallucinationHeuristic = hallucinationHeuristic;
        this.auditService = auditService;
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.feedbackRepository = feedbackRepository;
        this.objectMapper = objectMapper;
    }

    public void streamChat(Authentication auth, AiDtos.AiChatRequest request, SseEmitter emitter) {
        Executors.newVirtualThreadPerTaskExecutor().execute(() -> {
            try {
                streamChatSync(auth, request, emitter);
                emitter.complete();
            } catch (Exception e) {
                try {
                    sendSse(emitter, AiStreamChunk.error(e.getMessage() != null ? e.getMessage() : "Stream failed"));
                } catch (IOException ignored) {
                }
                emitter.completeWithError(e);
            }
        });
    }

    private void sendSse(SseEmitter emitter, AiStreamChunk chunk) throws IOException {
        emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(chunk)));
    }

    private void streamChatSync(Authentication auth, AiDtos.AiChatRequest request, SseEmitter emitter) throws Exception {
        long start = System.currentTimeMillis();
        authorizationService.assertCanAccessPatient(auth, request.getPatientId());
        Long userId = authorizationService.currentUserId(auth);

        UUID sessionId = request.getSessionId() != null ? UUID.fromString(request.getSessionId()) : UUID.randomUUID();
        AiChatSession session = sessionRepository.findById(sessionId).orElseGet(() -> createSession(sessionId, userId, request, auth));
        session.setLastActivityAt(Instant.now());
        sessionRepository.save(session);

        List<AiChatMessage> priorTurns = messageRepository.findBySession_IdOrderByCreatedAtAsc(session.getId());
        persistMessage(session, "USER", request.getMessage(), false, null, null, null, null);

        if (guardrailService.isPromptInjectionAttempt(request.getMessage())) {
            streamBlocked(userId, request, sessionId, session, emitter, start,
                    "I can't help with that request.", "Prompt rejected by security policy.");
            return;
        }

        if (guardrailService.isEmergencyPrompt(request.getMessage())) {
            String msg = "Your message may describe an emergency. Please seek immediate medical care or call emergency services now.";
            sendSse(emitter, AiStreamChunk.token(msg));
            persistMessage(session, "ASSISTANT", msg, false, null, "[]", null, null);
            AiDtos.AiChatResponse esc = baseResponse(sessionId);
            esc.setNeedsEscalation(true);
            esc.setAnswer(msg);
            auditService.log(userId, request.getPatientId(), "CHAT_STREAM", request, esc, false,
                    null, System.currentTimeMillis() - start, sessionId, null, null, null, true, null);
            sendSse(emitter, AiStreamChunk.citations(List.of()));
            sendSse(emitter, AiStreamChunk.done());
            return;
        }

        AiGuardrailService.SymptomTriage triage = guardrailService.triage(request.getMessage());
        AiRetrievalBundle bundle = retrievalService.retrieve(
                request.getPatientId(), request.getContextType(), request.getContextRefId(), request.getMessage(),
                request.getPortal());
        String systemPrompt = augmentSystemForTriage(
                promptBuilder.buildSystemPrompt(resolveRole(auth), request.getPortal(), bundle.contextSnippets()), triage);

        List<Message> chatMessages = new ArrayList<>(toHistoryMessages(priorTurns));
        chatMessages.add(new UserMessage(request.getMessage()));

        StringBuilder acc = new StringBuilder();
        Usage streamUsage = null;
        try {
            Flux<String> flux = chatClient.prompt()
                    .system(systemPrompt)
                    .messages(chatMessages)
                    .stream()
                    .content();
            flux.doOnNext(token -> {
                acc.append(token);
                try {
                    sendSse(emitter, AiStreamChunk.token(token));
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }).blockLast(Duration.ofMinutes(8));
        } catch (Throwable ex) {
            ChatResponse full = chatClient.prompt()
                    .system(systemPrompt)
                    .messages(chatMessages)
                    .call()
                    .chatResponse();
            streamUsage = full.getMetadata() != null ? full.getMetadata().getUsage() : null;
            String fullText = extractAssistantText(full);
            acc.setLength(0);
            acc.append(fullText != null ? fullText : "");
            for (String part : chunkForSse(acc.toString(), 32)) {
                sendSse(emitter, AiStreamChunk.token(part));
            }
        }

        boolean groundingWarn = hallucinationHeuristic.likelyUnsupportedNumericClaims(acc.toString(), bundle.groundingText());
        if (groundingWarn) {
            sendSse(emitter, AiStreamChunk.note(
                    "Some numeric details in this reply could not be matched to your approved chart context. Please verify with your care team."));
        }

        List<AiDtos.AiCitationDto> citationList = bundle.citations();
        sendSse(emitter, AiStreamChunk.citations(citationList));
        sendSse(emitter, AiStreamChunk.done());

        // Token usage: populated when streaming falls back to a synchronous call; otherwise null (latency still logged).
        int[] u = usageFrom(streamUsage);
        String citationsJson = writeCitationsJson(citationList);
        persistMessage(session, "ASSISTANT", acc.toString(), false, null, citationsJson, u[0], u[1]);

        AiDtos.AiChatResponse auditResponse = baseResponse(sessionId);
        auditResponse.setAnswer(acc.toString());
        auditResponse.setCitations(new ArrayList<>(citationList));
        auditResponse.setNeedsClinicalReview(triage == AiGuardrailService.SymptomTriage.CLINIC_REVIEW);
        auditResponse.setChartGroundingWarning(groundingWarn);
        log.info("AI chat outcome patientId={} portal={} mode=stream triage={} clinicalReview={} groundingWarning={} structuredCitations={}",
                request.getPatientId(), request.getPortal(), triage,
                triage == AiGuardrailService.SymptomTriage.CLINIC_REVIEW, groundingWarn,
                citationList.stream().map(AiDtos.AiCitationDto::getType).distinct().toList());
        auditService.log(userId, request.getPatientId(), "CHAT_STREAM", request, auditResponse, false,
                null, System.currentTimeMillis() - start, sessionId,
                boxed(u[0]), boxed(u[1]), boxed(u[2]), true, null);
    }

    private void streamBlocked(Long userId, AiDtos.AiChatRequest request, UUID sessionId, AiChatSession session,
                               SseEmitter emitter, long start, String msg, String reason) throws IOException {
        sendSse(emitter, AiStreamChunk.token(msg));
        persistMessage(session, "ASSISTANT", msg, true, reason, "[]", null, null);
        AiDtos.AiChatResponse blockedResp = baseResponse(sessionId);
        blockedResp.setBlocked(true);
        blockedResp.setBlockedReason(reason);
        blockedResp.setAnswer(msg);
        auditService.log(userId, request.getPatientId(), "CHAT_STREAM", request, blockedResp, true,
                reason, System.currentTimeMillis() - start, sessionId, null, null, null, true, null);
        sendSse(emitter, AiStreamChunk.citations(List.of()));
        sendSse(emitter, AiStreamChunk.done());
    }

    private static List<String> chunkForSse(String text, int maxChars) {
        List<String> parts = new ArrayList<>();
        if (text == null || text.isEmpty()) {
            return parts;
        }
        for (int i = 0; i < text.length(); i += maxChars) {
            parts.add(text.substring(i, Math.min(text.length(), i + maxChars)));
        }
        return parts;
    }

    @Transactional
    public AiDtos.AiChatResponse chat(Authentication auth, AiDtos.AiChatRequest request) {
        long start = System.currentTimeMillis();
        authorizationService.assertCanAccessPatient(auth, request.getPatientId());
        Long userId = authorizationService.currentUserId(auth);

        UUID sessionId = request.getSessionId() != null ? UUID.fromString(request.getSessionId()) : UUID.randomUUID();
        AiChatSession session = sessionRepository.findById(sessionId).orElseGet(() -> createSession(sessionId, userId, request, auth));
        session.setLastActivityAt(Instant.now());
        sessionRepository.save(session);

        AiDtos.AiChatResponse response = baseResponse(sessionId);
        List<AiChatMessage> priorTurns = messageRepository.findBySession_IdOrderByCreatedAtAsc(session.getId());
        persistMessage(session, "USER", request.getMessage(), false, null, null, null, null);

        if (guardrailService.isPromptInjectionAttempt(request.getMessage())) {
            response.setBlocked(true);
            response.setBlockedReason("Prompt rejected by security policy.");
            response.setAnswer("I can't help with that request.");
            persistMessage(session, "ASSISTANT", response.getAnswer(), true, response.getBlockedReason(), "[]", null, null);
            auditService.log(userId, request.getPatientId(), "CHAT", request, response, true,
                    response.getBlockedReason(), System.currentTimeMillis() - start, sessionId, null, null, null, true, null);
            return response;
        }

        if (guardrailService.isEmergencyPrompt(request.getMessage())) {
            response.setNeedsEscalation(true);
            response.setAnswer("Your message may describe an emergency. Please seek immediate medical care or call emergency services now.");
            persistMessage(session, "ASSISTANT", response.getAnswer(), false, null, "[]", null, null);
            auditService.log(userId, request.getPatientId(), "CHAT", request, response, false,
                    null, System.currentTimeMillis() - start, sessionId, null, null, null, true, null);
            return response;
        }

        AiGuardrailService.SymptomTriage triage = guardrailService.triage(request.getMessage());
        AiRetrievalBundle bundle = retrievalService.retrieve(
                request.getPatientId(), request.getContextType(), request.getContextRefId(), request.getMessage(),
                request.getPortal());
        String systemPrompt = augmentSystemForTriage(
                promptBuilder.buildSystemPrompt(resolveRole(auth), request.getPortal(), bundle.contextSnippets()), triage);

        List<Message> chatMessages = new ArrayList<>(toHistoryMessages(priorTurns));
        chatMessages.add(new UserMessage(request.getMessage()));

        ChatResponse chatResponse = chatClient.prompt()
                .system(systemPrompt)
                .messages(chatMessages)
                .call()
                .chatResponse();
        String answer = extractAssistantText(chatResponse);
        if (answer == null) {
            answer = "";
        }
        int[] u = usageFrom(chatResponse.getMetadata() != null ? chatResponse.getMetadata().getUsage() : null);

        response.setAnswer(answer);
        response.setCitations(bundle.citations());
        response.setNeedsClinicalReview(triage == AiGuardrailService.SymptomTriage.CLINIC_REVIEW);
        boolean groundingWarn = hallucinationHeuristic.likelyUnsupportedNumericClaims(answer, bundle.groundingText());
        response.setChartGroundingWarning(groundingWarn);
        if (groundingWarn) {
            response.setAnswer(answer + "\n\nNote: Some numeric details may not match your chart context; confirm with your clinician.");
        }

        String citationsJson = writeCitationsJson(bundle.citations());
        persistMessage(session, "ASSISTANT", answer, false, null, citationsJson, u[0], u[1]);
        log.info("AI chat outcome patientId={} portal={} mode=sync triage={} clinicalReview={} groundingWarning={} citationTypes={}",
                request.getPatientId(), request.getPortal(), triage,
                triage == AiGuardrailService.SymptomTriage.CLINIC_REVIEW, groundingWarn,
                bundle.citations().stream().map(AiDtos.AiCitationDto::getType).distinct().toList());
        auditService.log(userId, request.getPatientId(), "CHAT", request, response, false,
                null, System.currentTimeMillis() - start, sessionId,
                boxed(u[0]), boxed(u[1]), boxed(u[2]), true, null);
        return response;
    }

    private static Integer boxed(int v) {
        return v <= 0 ? null : v;
    }

    private String writeCitationsJson(List<AiDtos.AiCitationDto> citations) {
        try {
            return objectMapper.writeValueAsString(citations);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String augmentSystemForTriage(String systemPrompt, AiGuardrailService.SymptomTriage triage) {
        if (triage != AiGuardrailService.SymptomTriage.CLINIC_REVIEW) {
            return systemPrompt;
        }
        return systemPrompt + """

                TRIAGE: The user message may describe symptoms that warrant evaluation by a licensed clinician.
                Encourage appropriate in-person or telehealth follow-up. Do not provide a definitive diagnosis.""";
    }

    private List<Message> toHistoryMessages(List<AiChatMessage> priorTurns) {
        if (priorTurns == null || priorTurns.isEmpty()) {
            return List.of();
        }
        int from = Math.max(0, priorTurns.size() - MAX_HISTORY_MESSAGES);
        List<Message> out = new ArrayList<>();
        for (int i = from; i < priorTurns.size(); i++) {
            AiChatMessage m = priorTurns.get(i);
            if (Boolean.TRUE.equals(m.getBlocked())) {
                continue;
            }
            if ("USER".equalsIgnoreCase(m.getSender())) {
                out.add(new UserMessage(m.getContent()));
            } else if ("ASSISTANT".equalsIgnoreCase(m.getSender())) {
                out.add(new AssistantMessage(m.getContent()));
            }
        }
        return out;
    }

    private static String extractAssistantText(ChatResponse cr) {
        if (cr == null || cr.getResult() == null || cr.getResult().getOutput() == null) {
            return "";
        }
        return cr.getResult().getOutput().getText();
    }

    private static int[] usageFrom(Usage u) {
        if (u == null) {
            return new int[]{0, 0, 0};
        }
        int p = u.getPromptTokens() != null ? u.getPromptTokens() : 0;
        int c = u.getCompletionTokens() != null ? u.getCompletionTokens() : 0;
        int t = u.getTotalTokens() != null ? u.getTotalTokens() : (p + c);
        return new int[]{p, c, t};
    }

    public AiDtos.ExplainLabResultResponse explainLabResult(Authentication auth, AiDtos.ExplainLabResultRequest request) {
        authorizationService.assertCanAccessPatient(auth, request.getPatientId());
        AiDtos.ExplainLabResultResponse response = new AiDtos.ExplainLabResultResponse();
        response.setSummary("Your LDL is higher than the typical target range.");
        response.setPlainLanguageExplanation("LDL is often called 'bad cholesterol.' A higher value can increase long-term risk for heart disease.");
        response.setNextSteps(List.of("Discuss this result with your clinician.",
                "Ask whether repeat testing or lifestyle changes are recommended."));
        response.setCitations(List.of(new AiDtos.AiCitationDto("LAB_RESULT", request.getLabResultId(), "Lab result " + request.getLabResultId())));
        return response;
    }

    public AiDtos.SummarizePatientResponse summarizePatient(Authentication auth, AiDtos.SummarizePatientRequest request) {
        authorizationService.assertCanAccessPatient(auth, request.getPatientId());
        AiDtos.SummarizePatientResponse response = new AiDtos.SummarizePatientResponse();
        response.setPatientId(request.getPatientId());
        response.setSummaryType(request.getSummaryType());
        response.setSummary("Patient summary generated from authorized chart context. TODO: wire patient-specific structured retrieval.");
        response.setCitations(List.of(new AiDtos.AiCitationDto("PATIENT", request.getPatientId().toString(), "Patient chart context")));
        response.setBlocked(false);
        return response;
    }

    @Transactional
    public AiDtos.FeedbackResponse saveFeedback(Authentication auth, AiDtos.FeedbackRequest request) {
        Long userId = authorizationService.currentUserId(auth);
        AiFeedback feedback = new AiFeedback();
        feedback.setId(UUID.randomUUID());
        feedback.setMessageId(UUID.fromString(request.getMessageId()));
        feedback.setUserId(userId == null ? 0L : userId);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedback.setCreatedAt(Instant.now());
        feedbackRepository.save(feedback);
        return new AiDtos.FeedbackResponse(true);
    }

    public AiDtos.SessionHistoryResponse getSession(Authentication auth, String sessionId) {
        Long userId = authorizationService.currentUserId(auth);
        AiChatSession session = sessionRepository.findByIdAndUserId(UUID.fromString(sessionId), userId == null ? 0L : userId)
                .orElseThrow(() -> new SecurityException("Session not found"));
        List<AiChatMessage> messages = messageRepository.findBySession_IdOrderByCreatedAtAsc(session.getId());

        AiDtos.SessionHistoryResponse response = new AiDtos.SessionHistoryResponse();
        response.setSessionId(sessionId);
        response.setPatientId(session.getPatientId());
        response.setPortal(session.getPortal());
        response.setMessages(messages.stream()
                .map(m -> new AiDtos.SessionMessageDto(m.getId().toString(), m.getSender(), m.getContent(), m.getCreatedAt(), m.getBlocked()))
                .toList());
        return response;
    }

    private AiChatSession createSession(UUID sessionId, Long userId, AiDtos.AiChatRequest request, Authentication auth) {
        AiChatSession session = new AiChatSession();
        session.setId(sessionId);
        session.setUserId(userId == null ? 0L : userId);
        session.setPatientId(request.getPatientId());
        session.setPortal(request.getPortal());
        session.setRole(resolveRole(auth));
        session.setCreatedAt(Instant.now());
        session.setLastActivityAt(Instant.now());
        return session;
    }

    private void persistMessage(AiChatSession session, String sender, String content, boolean blocked, String blockedReason,
                                String citationsJson, Integer promptTokens, Integer completionTokens) {
        AiChatMessage message = new AiChatMessage();
        message.setId(UUID.randomUUID());
        message.setSession(session);
        message.setSender(sender);
        message.setContent(content);
        message.setBlocked(blocked);
        message.setBlockedReason(blockedReason);
        message.setCitationsJson(citationsJson);
        message.setPromptTokens(promptTokens);
        message.setCompletionTokens(completionTokens);
        message.setCreatedAt(Instant.now());
        messageRepository.save(message);
    }

    private AiDtos.AiChatResponse baseResponse(UUID sessionId) {
        AiDtos.AiChatResponse response = new AiDtos.AiChatResponse();
        response.setSessionId(sessionId.toString());
        response.setMessageId(UUID.randomUUID().toString());
        response.setTimestamp(Instant.now());
        response.setDisclaimer(DISCLAIMER);
        return response;
    }

    private String resolveRole(Authentication auth) {
        return auth.getAuthorities().stream().map(a -> a.getAuthority()).findFirst().orElse("ROLE_UNKNOWN");
    }
}
