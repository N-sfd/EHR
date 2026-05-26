package com.ehr.staffservice.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

class AiToggleEnvironmentPostProcessorTest {

    private final AiToggleEnvironmentPostProcessor processor = new AiToggleEnvironmentPostProcessor();

    @Test
    void whenAiDisabled_addsAutoconfigureExcludePropertySource() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("ehr.ai.enabled", "false");
        processor.postProcessEnvironment(env, new SpringApplication());
        assertThat(env.getProperty("spring.autoconfigure.exclude"))
                .contains("OpenAiChatAutoConfiguration")
                .contains("PgVectorStoreAutoConfiguration");
    }

    @Test
    void whenAiEnabledAndApiKeyPresent_doesNotAddExcludePropertySource() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("ehr.ai.enabled", "true");
        env.setProperty("spring.ai.openai.api-key", "sk-test-key");
        processor.postProcessEnvironment(env, new SpringApplication());
        assertThat(env.getProperty("spring.autoconfigure.exclude")).isNull();
    }

    @Test
    void whenAiEnabledButNoApiKey_addsExclusionsAndForcesAiOff() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("ehr.ai.enabled", "true");
        processor.postProcessEnvironment(env, new SpringApplication());
        assertThat(env.getProperty("spring.autoconfigure.exclude"))
                .contains("OpenAiAudioSpeechAutoConfiguration");
        assertThat(env.getProperty("ehr.ai.enabled", Boolean.class)).isFalse();
        assertThat(env.getProperty("app.ai.enabled", Boolean.class)).isFalse();
    }

    @Test
    void isAiEnabled_respectsEhrProperty() {
        MockEnvironment off = new MockEnvironment();
        off.setProperty("ehr.ai.enabled", "false");
        assertThat(AiToggleEnvironmentPostProcessor.isAiEnabled(off)).isFalse();

        MockEnvironment on = new MockEnvironment();
        on.setProperty("ehr.ai.enabled", "true");
        assertThat(AiToggleEnvironmentPostProcessor.isAiEnabled(on)).isTrue();
    }

    @Test
    void hasOpenAiApiKey_checksSpringAndEnvProperties() {
        MockEnvironment empty = new MockEnvironment();
        assertThat(AiToggleEnvironmentPostProcessor.hasOpenAiApiKey(empty)).isFalse();

        MockEnvironment springKey = new MockEnvironment();
        springKey.setProperty("spring.ai.openai.api-key", " sk ");
        assertThat(AiToggleEnvironmentPostProcessor.hasOpenAiApiKey(springKey)).isTrue();

        MockEnvironment envKey = new MockEnvironment();
        envKey.setProperty("OPENAI_API_KEY", "x");
        assertThat(AiToggleEnvironmentPostProcessor.hasOpenAiApiKey(envKey)).isTrue();
    }

    @Test
    void hasOpenAiApiKey_falseWhenValueIsUnresolvedPlaceholder() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("spring.ai.openai.api-key", "${OPENAI_API_KEY:}");
        assertThat(AiToggleEnvironmentPostProcessor.hasOpenAiApiKey(env)).isFalse();
    }
}
