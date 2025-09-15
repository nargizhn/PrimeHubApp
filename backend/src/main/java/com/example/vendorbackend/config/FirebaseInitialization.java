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
                creds = GoogleCredentials.getApplicationDefault();
            } catch (IOException ex) {
                var in = new ClassPathResource("firebase-service-account.json").getInputStream();
                creds = GoogleCredentials.fromStream(in);
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(creds)
                    .setProjectId("primehub-1c5f6") // güvenli eşleşme
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("🔥 Firebase initialized with project: " +
                    FirebaseApp.getInstance().getOptions().getProjectId());
        }
    }
}
