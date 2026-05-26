package com.ehr.staffservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.Map;

/**
 * Logs all registered Spring Boot endpoints at startup for debugging.
 */
@Slf4j
@Component
public class EndpointLoggingListener implements ApplicationListener<ApplicationReadyEvent> {

    @Override
    public void onApplicationEvent(@NonNull ApplicationReadyEvent event) {
        RequestMappingHandlerMapping mapping = event.getApplicationContext()
                .getBean(RequestMappingHandlerMapping.class);

        Map<RequestMappingInfo, HandlerMethod> handlerMethods = mapping.getHandlerMethods();
        
        log.info("=== Registered Dashboard Endpoints ===");
        handlerMethods.entrySet().stream()
                .forEach(entry -> {
                    RequestMappingInfo info = entry.getKey();
                    var patternsCondition = info.getPatternsCondition();
                    if (patternsCondition == null) return;
                    
                    String pattern = patternsCondition.getPatterns().toString();
                    if (!pattern.contains("/api/patient/dashboard")) return;
                    
                    HandlerMethod method = entry.getValue();
                    String controller = method.getBeanType().getSimpleName();
                    String methodName = method.getMethod().getName();
                    
                    log.info("  {} -> {}.{}()", pattern, controller, methodName);
                });
        log.info("=== End of Dashboard Endpoints ===");
    }
}

