package dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

public record ApiErrorResponse(
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+1")
        Instant timestamp,
        int status,
        String error,
        String code,
        String message,
        String path,
        Map<String, String> fieldErrors
) {
    public static ApiErrorResponse of(HttpStatus status, String code, String message, String path) {
        return new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                code,
                message,
                path,
                null
        );
    }

    public static ApiErrorResponse validation(String message, Map<String, String> fieldErrors, String path) {
        return new ApiErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "VALIDATION_ERROR",
                message,
                path,
                Map.copyOf(new LinkedHashMap<>(fieldErrors))
        );
    }
}
