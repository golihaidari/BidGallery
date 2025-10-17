package dk.dtu.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * Handles payment validation logic with an external payment provider (mocked).
 */
@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    //  Pipedream or mock payment validation endpoint
    private static final String PAYMENT_VALIDATION_URL = "https://eobr8yycab7ojzy.m.pipedream.net";

    // Validates a payment token by contacting an external provider.
    public boolean validatePayment(String paymentToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            logger.info("Validating payment token with external provider...");

            // Send request to external payment provider
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    PAYMENT_VALIDATION_URL,
                    Map.of("paymentToken", paymentToken),
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object success = response.getBody().get("success");

                boolean isValid = success instanceof Boolean && (Boolean) success;
                if (isValid) {
                    logger.info("Payment token validated successfully.");
                } else {
                    logger.warn("Payment token validation failed: {}", paymentToken);
                }
                return isValid;
            }

            logger.warn("Payment validation failed: unexpected response or empty body.");
            return false;
        } catch (Exception e) {
            logger.error("Payment validation exception: {}", e.getMessage());
            return false;
        }
    }
}
