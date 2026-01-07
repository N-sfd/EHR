package com.ehr.staffservice.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.hibernate.exception.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage());
        body.put("status", HttpStatus.NOT_FOUND.value());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<?> handleDuplicate(DuplicateResourceException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage());
        body.put("status", HttpStatus.CONFLICT.value());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return handleDatabaseConstraintError(ex);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<?> handleConstraintViolation(ConstraintViolationException ex) {
        return handleDatabaseConstraintError(ex);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<?> handleDataAccess(DataAccessException ex) {
        // Check if it's a constraint violation
        String message = ex.getMessage();
        if (message != null && (message.contains("foreign key") || message.contains("constraint"))) {
            return handleDatabaseConstraintError(ex);
        }
        // Otherwise, treat as general database error
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", "Database operation failed. Please try again.");
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private ResponseEntity<?> handleDatabaseConstraintError(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        String message = ex.getMessage();
        String fullMessage = message;
        
        // Try to get root cause message if available
        Throwable rootCause = ex.getCause();
        if (rootCause != null) {
            Throwable deepestCause = rootCause;
            while (deepestCause.getCause() != null) {
                deepestCause = deepestCause.getCause();
            }
            if (deepestCause.getMessage() != null) {
                fullMessage = deepestCause.getMessage();
            }
        }
        
        // Also check if it's a DataIntegrityViolationException with getRootCause
        if (ex instanceof DataIntegrityViolationException) {
            DataIntegrityViolationException divEx = (DataIntegrityViolationException) ex;
            Throwable divRootCause = divEx.getRootCause();
            if (divRootCause != null && divRootCause.getMessage() != null) {
                fullMessage = divRootCause.getMessage();
            }
        }
        
        // Extract meaningful error message from constraint violation
        if (fullMessage != null) {
            // Check for foreign key constraint violations (including batch execution errors)
            if (fullMessage.contains("foreign key constraint") || 
                fullMessage.contains("violates foreign key") ||
                fullMessage.contains("still referenced from table") ||
                (fullMessage.contains("could not execute batch") && fullMessage.contains("violates foreign key"))) {
                // Extract which table is referencing
                if (fullMessage.contains("designations")) {
                    message = "Cannot delete this department because it is still being used by one or more designations. Please remove or reassign the designations first.";
                } else if (fullMessage.contains("staff") || fullMessage.contains("doctors")) {
                    message = "Cannot delete this department because it is still assigned to staff members. Please reassign the staff first.";
                } else if (fullMessage.contains("departments")) {
                    message = "Cannot delete this record because it is still referenced by other records. Please remove the references first.";
                } else {
                    message = "Cannot delete this record because it is still being used elsewhere in the system. Please remove all references first.";
                }
            } else if (fullMessage.contains("duplicate key") || fullMessage.contains("unique constraint")) {
                if (fullMessage.contains("name")) {
                    message = "A record with this name already exists. Please choose a different name.";
                } else if (fullMessage.contains("code")) {
                    message = "A record with this code already exists. Please choose a different code.";
                } else {
                    message = "This record already exists. Please check for duplicates.";
                }
            } else {
                message = "Database constraint violation. Please check your input and try again.";
            }
        } else {
            message = "Database constraint violation. Please check your input and try again.";
        }
        
        body.put("success", false);
        body.put("message", message);
        body.put("status", HttpStatus.CONFLICT.value());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err ->
                errors.put(err.getField(), err.getDefaultMessage())
        );

        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", "Validation failed");
        body.put("errors", errors);
        body.put("status", HttpStatus.BAD_REQUEST.value());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
