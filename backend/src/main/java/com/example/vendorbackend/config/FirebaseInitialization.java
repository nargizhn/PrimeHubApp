package com.example.vendorbackend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

@Configuration
public class FirebaseInitialization {

    @PostConstruct
    public void init() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            GoogleCredentials creds;
            try {
                // Try to use Application Default Credentials (works in Cloud Run)
                creds = GoogleCredentials.getApplicationDefault();
                System.out.println("🔥 Using Application Default Credentials");
            } catch (IOException ex) {
                System.out.println("🔥 Application Default Credentials not available, trying service account file...");
                try {
                    var in = new ClassPathResource("firebase-service-account.json").getInputStream();
                    creds = GoogleCredentials.fromStream(in);
                    System.out.println("🔥 Using service account file");
                } catch (IOException fileEx) {
                    System.err.println("❌ Firebase authentication failed: " + fileEx.getMessage());
                    throw new RuntimeException("Failed to initialize Firebase credentials", fileEx);
                }
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(creds)
                    .setProjectId("primehub-vendor-tool") // Match current GCloud project
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("🔥 Firebase initialized successfully with project: " +
                    FirebaseApp.getInstance().getOptions().getProjectId());
        }
    }
}
