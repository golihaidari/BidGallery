package dk.dtu.backend.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import dk.dtu.backend.service.LoggingService;

@Configuration
public class FirebaseConfig {

    @Autowired
    private LoggingService loggingService;

    @PostConstruct
    public void initialize() {
        try (InputStream serviceAccount = getClass().getResourceAsStream("/firebase-service.json")) {
            if (serviceAccount == null) {
                loggingService.error("Firebase service account file not found in resources!", Map.of());
                throw new RuntimeException("Firebase service account file not found in resources!");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

            loggingService.info("Firebase initialized successfully", Map.of());

        } catch (IOException e) {
            loggingService.info(e.getMessage(), Map.of());
            throw new RuntimeException("Failed to initialize Firebase", e);
        }
    }
}
