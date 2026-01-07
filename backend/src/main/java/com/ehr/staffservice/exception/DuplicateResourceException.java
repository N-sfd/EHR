package com.ehr.staffservice.exception;

public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String msg) {
        super(msg);
    }
}

