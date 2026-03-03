package nknk.opus.project.common.exception;

import java.time.OffsetDateTime;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(
            IllegalArgumentException e, HttpServletRequest req
    ) {
        
    	return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of(
                        "timestamp", OffsetDateTime.now().toString(),
                        "status", 400,
                        "error", "Bad Request",
                        "message", e.getMessage(),
                        "path", req.getRequestURI()
                )
        );
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(
            IllegalStateException e, HttpServletRequest req
    ) {
        
    	return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of(
                        "timestamp", OffsetDateTime.now().toString(),
                        "status", 409,
                        "error", "Conflict",
                        "message", e.getMessage(),
                        "path", req.getRequestURI()
                )
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleServerError(
            Exception e, HttpServletRequest req
    ) {
        
    	return ResponseEntity
    			.status(HttpStatus.INTERNAL_SERVER_ERROR)
    			.body(
                Map.of(
                        "timestamp", OffsetDateTime.now().toString(),
                        "status", 500,
                        "error", "Internal Server Error",
                        "message", "서버 오류가 발생했습니다.",
                        "path", req.getRequestURI()
                )
        );
    }
}
