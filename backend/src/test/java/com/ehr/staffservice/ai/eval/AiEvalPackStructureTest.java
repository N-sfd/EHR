package com.ehr.staffservice.ai.eval;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.io.IOException;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AiEvalPackStructureTest {

    private static final List<AiEvalCase> ALL = loadAll();

    private static List<AiEvalCase> loadAll() {
        try {
            return AiEvalPackLoader.loadAllPacks();
        } catch (IOException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    static Stream<AiEvalCase> allCases() {
        return ALL.stream();
    }

    @ParameterizedTest
    @MethodSource("allCases")
    void eachCaseHasRequiredShape(AiEvalCase c) {
        assertNotNull(c.name());
        assertFalse(c.name().isBlank());
        assertNotNull(c.role());
        assertFalse(c.role().isBlank());
        assertNotNull(c.portal());
        assertFalse(c.portal().isBlank());
        assertNotNull(c.request());
        assertNotNull(c.request().message());
        assertFalse(c.request().message().isBlank());
        assertNotNull(c.request().contextType());
        assertFalse(c.request().contextType().isBlank());
        assertNotNull(c.request().contextRefId());
        assertNotNull(c.expectedRetrievalTypes());
        assertFalse(c.expectedRetrievalTypes().isEmpty());
        assertNotNull(c.expected());
        assertNotNull(c.expected().mustContain());
        assertNotNull(c.expected().forbidden());
    }

    @Test
    void fivePackFilesLoad() {
        assertTrue(ALL.size() >= 5, "Expected at least one scenario per pack file");
    }
}
