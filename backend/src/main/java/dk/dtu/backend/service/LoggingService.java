package dk.dtu.backend.service;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

@Service
public class LoggingService {

    private static final Logger logger = LoggerFactory.getLogger("AppLogger");

    /**
     * Log info message with optional key-value fields
     */
    public void info(String message, Map<String, String> fields) {
        if (fields != null) fields.forEach(MDC::put);
        logger.info(message);
        if (fields != null) fields.keySet().forEach(MDC::remove);
    }

    public void warn(String message, Map<String, String> fields) {
        if (fields != null) fields.forEach(MDC::put);
        logger.warn(message);
        if (fields != null) fields.keySet().forEach(MDC::remove);
    }

    public void error(String message, Map<String, String> fields) {
        if (fields != null) fields.forEach(MDC::put);
        logger.error(message);
        if (fields != null) fields.keySet().forEach(MDC::remove);
    }

    public void debug(String message, Map<String, String> fields) {
        if (fields != null) fields.forEach(MDC::put);
        logger.debug(message);
        if (fields != null) fields.keySet().forEach(MDC::remove);
    }
}
