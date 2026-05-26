package com.ehr.staffservice.ai.eval;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeFalse;

class AiEvalGoldenPhraseTest {

    private static final List<AiEvalCase> GOLDEN = loadGolden();

    private static List<AiEvalCase> loadGolden() {
        try {
            return AiEvalPackLoader.loadAllPacks().stream()
                    .filter(c -> c.goldenAnswer() != null && !c.goldenAnswer().isBlank())
                    .toList();
        } catch (IOException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    static Stream<AiEvalCase> goldenCases() {
        return GOLDEN.stream();
    }

    @ParameterizedTest
    @MethodSource("goldenCases")
    void goldenAnswerRespectsPhraseContract(AiEvalCase c) {
        String text = c.goldenAnswer().toLowerCase(Locale.ROOT);
        assumeFalse(text.isBlank());
        for (String phrase : c.expected().mustContain()) {
            assertTrue(text.contains(phrase.toLowerCase(Locale.ROOT)),
                    () -> c.name() + " must contain: " + phrase);
        }
        for (String phrase : c.expected().forbidden()) {
            assertFalse(text.contains(phrase.toLowerCase(Locale.ROOT)),
                    () -> c.name() + " must not contain: " + phrase);
        }
    }
}
