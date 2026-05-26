package com.ehr.staffservice.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Set;

/**
 * Utility for masking Protected Health Information (PHI) in logs
 * Masks: SSN, email, phone, address, dateOfBirth, photoUrl (base64)
 */
public class PhiMaskingUtil {
    
    private static final Logger log = LoggerFactory.getLogger(PhiMaskingUtil.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    // Fields that contain PHI
    private static final Set<String> PHI_FIELDS = Set.of(
        "ssn", "socialSecurityNumber", "ssnLast4",
        "email", "emailAddress",
        "phone", "phoneNumber", "mobile", "homePhone", "workPhone", "emergencyContactPhone",
        "address", "addressLine1", "addressLine2", "city", "state", "zipCode", "pincode",
        "dateOfBirth", "dob", "birthDate",
        "photoUrl", "photo_url", "profileImage", "avatar",
        "insurancePolicyNumber", "memberId", "groupNumber"
    );
    
    /**
     * Mask PHI fields in a JSON string
     */
    public static String maskPhi(String json) {
        if (json == null || json.isEmpty()) {
            return json;
        }
        
        try {
            ObjectNode node = (ObjectNode) objectMapper.readTree(json);
            maskPhiFields(node);
            return objectMapper.writeValueAsString(node);
        } catch (Exception e) {
            log.warn("Failed to mask PHI in JSON, returning original: {}", e.getMessage());
            return maskPhiSimple(json);
        }
    }
    
    /**
     * Mask PHI fields in an ObjectNode recursively
     */
    private static void maskPhiFields(ObjectNode node) {
        if (node == null) return;
        
        node.fieldNames().forEachRemaining(fieldName -> {
            String lowerFieldName = fieldName.toLowerCase();
            
            // Check if field name contains PHI keywords
            boolean isPhiField = PHI_FIELDS.stream()
                .anyMatch(phi -> lowerFieldName.contains(phi.toLowerCase()));
            
            if (isPhiField && node.get(fieldName).isTextual()) {
                String value = node.get(fieldName).asText();
                if (value != null && !value.isEmpty()) {
                    node.put(fieldName, maskValue(fieldName, value));
                }
            } else if (node.get(fieldName).isObject()) {
                maskPhiFields((ObjectNode) node.get(fieldName));
            } else if (node.get(fieldName).isArray()) {
                node.get(fieldName).forEach(element -> {
                    if (element.isObject()) {
                        maskPhiFields((ObjectNode) element);
                    }
                });
            }
        });
    }
    
    /**
     * Mask a specific value based on field name and value type
     */
    private static String maskValue(String fieldName, String value) {
        String lowerFieldName = fieldName.toLowerCase();
        
        // Email: mask domain, show first letter
        if (lowerFieldName.contains("email")) {
            if (value.contains("@")) {
                String[] parts = value.split("@");
                if (parts.length == 2) {
                    return parts[0].charAt(0) + "***@" + "***.***";
                }
            }
            return "***@***.***";
        }
        
        // Phone: show last 4 digits
        if (lowerFieldName.contains("phone")) {
            if (value.length() >= 4) {
                return "***-***-" + value.substring(value.length() - 4);
            }
            return "***-***-****";
        }
        
        // SSN: show last 4 digits
        if (lowerFieldName.contains("ssn") || lowerFieldName.contains("social")) {
            String digits = value.replaceAll("[^0-9]", "");
            if (digits.length() >= 4) {
                return "***-**-" + digits.substring(digits.length() - 4);
            }
            return "***-**-****";
        }
        
        // Date of birth: show year only
        if (lowerFieldName.contains("birth") || lowerFieldName.contains("dob")) {
            if (value.length() >= 4) {
                return "****-**-** (" + value.substring(0, 4) + ")";
            }
            return "****-**-**";
        }
        
        // Address: mask most of it
        if (lowerFieldName.contains("address") || lowerFieldName.contains("city") || 
            lowerFieldName.contains("state") || lowerFieldName.contains("zip") || 
            lowerFieldName.contains("pincode")) {
            if (value.length() > 5) {
                return value.substring(0, 2) + "***";
            }
            return "***";
        }
        
        // Photo URL (base64): mask if it's a data URL
        if (lowerFieldName.contains("photo") || lowerFieldName.contains("avatar") || 
            lowerFieldName.contains("image")) {
            if (value.startsWith("data:image")) {
                return "[BASE64_IMAGE_DATA_MASKED]";
            }
            if (value.length() > 50) {
                return value.substring(0, 20) + "...[MASKED]";
            }
            return "[IMAGE_URL_MASKED]";
        }
        
        // Insurance policy number: show last 4
        if (lowerFieldName.contains("policy") || lowerFieldName.contains("member") || 
            lowerFieldName.contains("group")) {
            if (value.length() >= 4) {
                return "***" + value.substring(value.length() - 4);
            }
            return "****";
        }
        
        // Default: mask most of the value
        if (value.length() > 4) {
            return value.substring(0, 2) + "***" + value.substring(value.length() - 2);
        }
        return "***";
    }
    
    /**
     * Simple regex-based masking for non-JSON strings
     */
    private static String maskPhiSimple(String text) {
        if (text == null) return null;
        
        // Mask emails
        text = text.replaceAll("([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})", 
            "$1***@***.***");
        
        // Mask phone numbers (various formats)
        text = text.replaceAll("(\\+?1[-.]?)?\\(?([0-9]{3})\\)?[-.]?([0-9]{3})[-.]?([0-9]{4})", 
            "***-***-$4");
        
        // Mask SSN
        text = text.replaceAll("(\\d{3})[-.]?(\\d{2})[-.]?(\\d{4})", "***-**-$3");
        
        return text;
    }
    
    /**
     * Log request with PHI masking
     */
    public static void logRequest(String endpoint, String method, Object body) {
        try {
            String bodyJson = objectMapper.writeValueAsString(body);
            String maskedBody = maskPhi(bodyJson);
            log.info("REQUEST: {} {} | Body: {}", method, endpoint, maskedBody);
        } catch (Exception e) {
            log.info("REQUEST: {} {} | Body: [Unable to serialize]", method, endpoint);
        }
    }
    
    /**
     * Log response with PHI masking
     */
    public static void logResponse(String endpoint, String method, int status, Object body) {
        try {
            String bodyJson = objectMapper.writeValueAsString(body);
            String maskedBody = maskPhi(bodyJson);
            log.info("RESPONSE: {} {} | Status: {} | Body: {}", method, endpoint, status, maskedBody);
        } catch (Exception e) {
            log.info("RESPONSE: {} {} | Status: {} | Body: [Unable to serialize]", method, endpoint, status);
        }
    }
}

