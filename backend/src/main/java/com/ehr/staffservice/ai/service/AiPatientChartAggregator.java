package com.ehr.staffservice.ai.service;

import com.ehr.staffservice.ai.dto.AiDtos;
import com.ehr.staffservice.entity.Appointment;
import com.ehr.staffservice.entity.Encounter;
import com.ehr.staffservice.entity.LabResult;
import com.ehr.staffservice.entity.LabResultItem;
import com.ehr.staffservice.entity.PatientMedication;
import com.ehr.staffservice.repository.AppointmentRepository;
import com.ehr.staffservice.repository.EncounterRepository;
import com.ehr.staffservice.repository.LabResultRepository;
import com.ehr.staffservice.repository.PatientMedicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Pulls labs, meds, appointments, encounter notes from the DB and merges optional pgvector hits on {@code ai_document_chunk}.
 */
@Service
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiPatientChartAggregator {

    private static final Logger log = LoggerFactory.getLogger(AiPatientChartAggregator.class);

    private static final int MAX_LABS = 8;
    private static final int MAX_MEDS = 16;
    private static final int MAX_APPOINTMENTS = 10;
    private static final int MAX_ENCOUNTERS = 8;
    private static final int VECTOR_SNIPPETS = 5;

    private final LabResultRepository labResultRepository;
    private final PatientMedicationRepository patientMedicationRepository;
    private final AppointmentRepository appointmentRepository;
    private final EncounterRepository encounterRepository;
    private final AiVectorChunkSearchService vectorChunkSearchService;

    public AiPatientChartAggregator(LabResultRepository labResultRepository,
                                  PatientMedicationRepository patientMedicationRepository,
                                  AppointmentRepository appointmentRepository,
                                  EncounterRepository encounterRepository,
                                  AiVectorChunkSearchService vectorChunkSearchService) {
        this.labResultRepository = labResultRepository;
        this.patientMedicationRepository = patientMedicationRepository;
        this.appointmentRepository = appointmentRepository;
        this.encounterRepository = encounterRepository;
        this.vectorChunkSearchService = vectorChunkSearchService;
    }

    @Transactional(readOnly = true)
    public AiRetrievalBundle aggregate(Long patientId, String contextType, String contextRefId,
                                       String userMessage, String chatPortal) {
        List<String> snippets = new ArrayList<>();
        Map<String, AiDtos.AiCitationDto> citations = new LinkedHashMap<>();

        appendLabs(patientId, contextType, contextRefId, snippets, citations);
        appendMedications(patientId, snippets, citations);
        appendAppointments(patientId, snippets, citations);
        appendEncounters(patientId, snippets, citations);

        int structuredSnippets = snippets.size();
        AiVectorChunkSearchService.VectorSearchHits vectorHits = vectorChunkSearchService.searchHits(
                patientId, userMessage, VECTOR_SNIPPETS, chatPortal);
        List<String> vectorSnippets = vectorHits.snippets();
        snippets.addAll(vectorSnippets);
        for (AiDtos.AiCitationDto c : vectorHits.citations()) {
            citations.putIfAbsent(key(c), c);
        }

        if (snippets.isEmpty()) {
            snippets.add("No structured chart snippets were found for this patient in the local database. "
                    + "Do not invent labs, medications, appointments, or visit details.");
        }

        log.info("AI retrieval patientId={} portal={} structuredSnippets={} vectorHits={} citationCount={}",
                patientId, chatPortal, structuredSnippets, vectorSnippets.size(), citations.size());

        String groundingText = snippets.stream().collect(Collectors.joining("\n")).toLowerCase(Locale.ROOT);
        return new AiRetrievalBundle(snippets, new ArrayList<>(citations.values()), groundingText);
    }

    private static String key(AiDtos.AiCitationDto c) {
        return c.getType().toUpperCase(Locale.ROOT) + ":" + c.getRefId();
    }

    private void appendLabs(Long patientId, String contextType, String contextRefId,
                            List<String> snippets, Map<String, AiDtos.AiCitationDto> citations) {
        List<LabResult> labs = new ArrayList<>(labResultRepository.findByPatientIdAndDateRange(patientId, null, null));
        Long focusedId = parseLong(contextRefId);
        if (focusedId != null && contextType != null && "LAB_RESULT".equalsIgnoreCase(contextType)) {
            Optional<LabResult> focused = labResultRepository.findByIdAndPatientId(focusedId, patientId);
            if (focused.isPresent()) {
                labs.removeIf(r -> r.getResultId().equals(focusedId));
                labs.addFirst(focused.get());
            }
        }
        labs.stream().limit(MAX_LABS).forEach(lab -> {
            String line = formatLab(lab);
            snippets.add(line);
            var cit = new AiDtos.AiCitationDto("LAB_RESULT", String.valueOf(lab.getResultId()),
                    lab.getPanelName() + " (" + lab.getResultDate() + ")");
            citations.putIfAbsent(key(cit), cit);
        });
    }

    private static String formatLab(LabResult lab) {
        StringBuilder sb = new StringBuilder();
        sb.append("[lab result id=").append(lab.getResultId()).append("] ");
        sb.append("Panel: ").append(lab.getPanelName());
        sb.append("; ordered ").append(lab.getOrderDate());
        if (lab.getResultDate() != null) {
            sb.append("; resulted ").append(lab.getResultDate());
        }
        sb.append("; status ").append(lab.getStatus());
        if (lab.getItems() != null && !lab.getItems().isEmpty()) {
            List<LabResultItem> ordered = lab.getItems().stream()
                    .sorted(Comparator.comparing(LabResultItem::getDisplayOrder, Comparator.nullsLast(Comparator.naturalOrder())))
                    .toList();
            sb.append(". Items: ");
            for (LabResultItem it : ordered) {
                sb.append(it.getTestName()).append("=").append(it.getValue());
                if (it.getUnits() != null && !it.getUnits().isBlank()) {
                    sb.append(" ").append(it.getUnits());
                }
                if (Boolean.TRUE.equals(it.getAbnormal())) {
                    sb.append(" (abnormal)");
                }
                sb.append("; ");
            }
        }
        return sb.toString().trim();
    }

    private void appendMedications(Long patientId, List<String> snippets, Map<String, AiDtos.AiCitationDto> citations) {
        List<PatientMedication> meds = patientMedicationRepository
                .findByPatient_PatientIdAndIsActiveOrderByPrescribedDateDesc(patientId, true);
        meds.stream().limit(MAX_MEDS).forEach(m -> {
            String line = "[medication id=" + m.getMedicationId() + "] " + m.getMedicationName()
                    + " " + m.getDosage() + " " + m.getFrequency()
                    + "; prescribed " + m.getPrescribedDate()
                    + (Boolean.TRUE.equals(m.getIsActive()) ? " (active)" : "");
            snippets.add(line);
            citations.putIfAbsent(key(new AiDtos.AiCitationDto("MEDICATION", String.valueOf(m.getMedicationId()), m.getMedicationName())),
                    new AiDtos.AiCitationDto("MEDICATION", String.valueOf(m.getMedicationId()), m.getMedicationName()));
        });
    }

    private void appendAppointments(Long patientId, List<String> snippets, Map<String, AiDtos.AiCitationDto> citations) {
        List<Appointment> appts = appointmentRepository.findByPatientIdOrderByStartAtDesc(patientId);
        appts.stream().limit(MAX_APPOINTMENTS).forEach(a -> {
            StringBuilder sb = new StringBuilder();
            sb.append("[appointment id=").append(a.getId()).append("] ");
            sb.append(a.getStartAt()).append(" → ").append(a.getEndAt());
            sb.append("; status ").append(a.getStatus());
            if (a.getVisitType() != null && !a.getVisitType().isBlank()) {
                sb.append("; visit type ").append(a.getVisitType());
            }
            if (a.getReason() != null && !a.getReason().isBlank()) {
                sb.append("; reason ").append(a.getReason());
            }
            snippets.add(sb.toString());
            var cit = new AiDtos.AiCitationDto("APPOINTMENT", String.valueOf(a.getId()), "Appointment " + a.getStartAt());
            citations.putIfAbsent(key(cit), cit);
        });
    }

    private void appendEncounters(Long patientId, List<String> snippets, Map<String, AiDtos.AiCitationDto> citations) {
        List<Encounter> encounters = encounterRepository.findRecentByPatientId(patientId, PageRequest.of(0, MAX_ENCOUNTERS));
        for (Encounter e : encounters) {
            StringBuilder sb = new StringBuilder();
            sb.append("[encounter id=").append(e.getId()).append("] ");
            sb.append("type ").append(e.getEncounterType());
            sb.append("; status ").append(e.getEncounterStatus());
            if (e.getCheckInDateTime() != null) {
                sb.append("; check-in ").append(e.getCheckInDateTime());
            }
            if (e.getChiefComplaint() != null && !e.getChiefComplaint().isBlank()) {
                sb.append("; chief complaint: ").append(e.getChiefComplaint());
            }
            if (e.getVisitReason() != null && !e.getVisitReason().isBlank()) {
                sb.append("; visit reason: ").append(e.getVisitReason());
            }
            if (e.getNotes() != null && !e.getNotes().isBlank()) {
                sb.append("; notes: ").append(truncate(e.getNotes(), 400));
            }
            snippets.add(sb.toString());
            var cit = new AiDtos.AiCitationDto("ENCOUNTER", String.valueOf(e.getId()), "Encounter " + e.getEncounterType());
            citations.putIfAbsent(key(cit), cit);
        }
    }

    private static String truncate(String s, int max) {
        String t = s.replace('\n', ' ').trim();
        return t.length() <= max ? t : t.substring(0, max) + "…";
    }

    private static Long parseLong(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(s.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
