package com.ehr.staffservice.ai.eval;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public final class AiEvalPackLoader {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static final String[] PACK_FILES = {
            "lab-explanations.json",
            "medication-help.json",
            "appointment-qa.json",
            "unsafe-prompts.json",
            "access-boundary.json"
    };

    private AiEvalPackLoader() {
    }

    public static List<AiEvalCase> loadPack(String classpathResourceUnderAiEvals) throws IOException {
        String path = "/ai-evals/" + classpathResourceUnderAiEvals;
        try (InputStream in = AiEvalPackLoader.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing classpath resource: " + path);
            }
            return MAPPER.readValue(in, new TypeReference<List<AiEvalCase>>() {
            });
        }
    }

    public static List<AiEvalCase> loadAllPacks() throws IOException {
        List<AiEvalCase> out = new ArrayList<>();
        for (String f : PACK_FILES) {
            out.addAll(loadPack(f));
        }
        return out;
    }
}
