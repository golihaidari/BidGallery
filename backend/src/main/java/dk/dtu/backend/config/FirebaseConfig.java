package dk.dtu.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import dk.dtu.backend.service.LoggingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

@Configuration
public class FirebaseConfig {

    @Autowired
    private LoggingService loggingService;

    @PostConstruct
    public void initialize() {
        try (InputStream serviceAccount = getClass().getResourceAsStream("/firebase-service.json")) {
            if (serviceAccount == null) {
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
            throw new RuntimeException("Failed to initialize Firebase", e);
        }
    }
}
