package com.ehr.staffservice.ai.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Assistant-side contracts that do not require the LLM: numeric grounding heuristic and portal mapping for retrieval.
 */
class AiAssistantContractTest {

    private final AiHallucinationHeuristic heuristic = new AiHallucinationHeuristic();

    @Test
    void hallucinationHeuristicFlagsSeveralMissingNumbers() {
        String answer = "We see values 4411 and 9922 on the report.";
        String ground = "lab panel discussed without numeric results attached";
        assertTrue(heuristic.likelyUnsupportedNumericClaims(answer, ground.toLowerCase()));
    }

    @Test
    void hallucinationHeuristicQuietWhenGroundingMatches() {
        String answer = "Your LDL was 142.";
        String ground = "ldl 142";
        assertFalse(heuristic.likelyUnsupportedNumericClaims(answer, ground.toLowerCase()));
    }

    @Test
    void mychartPortalMapsToPatientFacingFilters() {
        assertEquals("MYCHART", AiVectorChunkSearchService.portalFilterValue("MYCHART"));
        assertEquals("PATIENT", AiVectorChunkSearchService.audienceFilterValue("MYCHART"));
    }

    @Test
    void staffPortalMapsToAdminFilters() {
        assertEquals("ADMIN", AiVectorChunkSearchService.portalFilterValue("STAFF"));
        assertEquals("STAFF", AiVectorChunkSearchService.audienceFilterValue("STAFF"));
    }
}
