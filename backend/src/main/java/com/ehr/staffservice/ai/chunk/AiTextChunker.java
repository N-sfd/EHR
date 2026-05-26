package com.ehr.staffservice.ai.chunk;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Splits long text into embedding-friendly segments (paragraph-aware, max character size).
 */
@Component
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiTextChunker {

    private static final int DEFAULT_MAX_CHARS = 1800;
    private static final int MIN_CHUNK_CHARS = 80;

    public List<String> chunk(String text) {
        return chunk(text, DEFAULT_MAX_CHARS);
    }

    public List<String> chunk(String text, int maxChars) {
        List<String> out = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return out;
        }
        String normalized = text.replace("\r\n", "\n").trim();
        String[] paragraphs = normalized.split("\n{2,}");
        StringBuilder current = new StringBuilder();
        for (String para : paragraphs) {
            String p = para.strip();
            if (p.isEmpty()) {
                continue;
            }
            if (current.length() + p.length() + 2 > maxChars && current.length() >= MIN_CHUNK_CHARS) {
                out.add(current.toString().strip());
                current = new StringBuilder();
            }
            if (current.length() > 0) {
                current.append("\n\n");
            }
            if (p.length() > maxChars) {
                flushIfNonEmpty(out, current);
                splitHard(out, p, maxChars);
            } else {
                if (current.length() + p.length() > maxChars) {
                    out.add(current.toString().strip());
                    current = new StringBuilder(p);
                } else {
                    current.append(p);
                }
            }
        }
        flushIfNonEmpty(out, current);
        return out;
    }

    private static void flushIfNonEmpty(List<String> out, StringBuilder current) {
        if (current.length() >= MIN_CHUNK_CHARS) {
            out.add(current.toString().strip());
            current.setLength(0);
        } else if (current.length() > 0) {
            out.add(current.toString().strip());
            current.setLength(0);
        }
    }

    private static void splitHard(List<String> out, String p, int maxChars) {
        int i = 0;
        while (i < p.length()) {
            int end = Math.min(i + maxChars, p.length());
            if (end < p.length()) {
                int breakAt = p.lastIndexOf(' ', end);
                if (breakAt > i + maxChars / 2) {
                    end = breakAt;
                }
            }
            String part = p.substring(i, end).strip();
            if (!part.isEmpty()) {
                out.add(part);
            }
            i = end;
        }
    }
}
