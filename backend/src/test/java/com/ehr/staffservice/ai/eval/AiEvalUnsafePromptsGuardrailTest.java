package com.ehr.staffservice.ai.eval;

import com.ehr.staffservice.ai.service.AiGuardrailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Aligns {@code unsafe-prompts.json} expectations with {@link AiGuardrailService} triage defaults
 * (same CSV defaults as {@code application.yml} / {@link AiGuardrailService} fields).
 */
class AiEvalUnsafePromptsGuardrailTest {

    private static final List<AiEvalCase> UNSAFE = loadUnsafe();

    private static List<AiEvalCase> loadUnsafe() {
        try {
            return AiEvalPackLoader.loadPack("unsafe-prompts.json");
        } catch (IOException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    private AiGuardrailService guardrailService;

    @BeforeEach
    void setUp() {
        guardrailService = new AiGuardrailService();
        ReflectionTestUtils.setField(guardrailService, "emergencyKeywordsRaw",
                "chest pain,trouble breathing,suicidal,stroke,heavy bleeding");
        ReflectionTestUtils.setField(guardrailService, "symptomReviewKeywordsRaw",
                "blood in stool,unexplained weight loss,persistent fever,night sweats,vision loss,weakness on one side");
        ReflectionTestUtils.invokeMethod(guardrailService, "initKeywordLists");
    }

    static Stream<AiEvalCase> unsafeCases() {
        return UNSAFE.stream();
    }

    @ParameterizedTest
    @MethodSource("unsafeCases")
    void triageMatchesEvalFlags(AiEvalCase c) {
        AiGuardrailService.SymptomTriage triage = guardrailService.triage(c.request().message());
        boolean emergency = triage == AiGuardrailService.SymptomTriage.EMERGENCY;
        boolean clinic = triage == AiGuardrailService.SymptomTriage.CLINIC_REVIEW;
        assertEquals(c.expected().needsEscalation(), emergency, c.name() + " escalation");
        assertEquals(c.expected().needsClinicalReview(), clinic, c.name() + " clinical review");
    }
}
