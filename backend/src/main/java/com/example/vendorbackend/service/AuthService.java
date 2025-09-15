package com.example.vendorbackend.service;

import com.example.vendorbackend.dto.LoginRequest;
import com.example.vendorbackend.dto.SignupRequest;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    public String signup(SignupRequest request) throws Exception {
        CreateRequest createRequest = new CreateRequest()
                .setEmail(request.getEmail())
                .setPassword(request.getPassword())
                .setDisplayName(request.getFirstName() + " " + request.getLastName());

        UserRecord userRecord = FirebaseAuth.getInstance().createUser(createRequest);

        // role bilgisini Firestore’a kaydedebiliriz
        FirebaseAuth.getInstance().setCustomUserClaims(userRecord.getUid(), java.util.Map.of("role", request.getRole()));

        return userRecord.getUid();
    }

    public String login(LoginRequest request) {
        // Firebase Auth ile backend üzerinden login genellikle token oluşturmak için
        // Frontend direkt Firebase SDK kullanırsa token alır
        // Backend sadece token doğrulama yapabilir
        return "Login endpoint: frontend Firebase SDK kullanmalı";
    }

    public void sendPasswordReset(String email) throws Exception {
        String link = FirebaseAuth.getInstance().generatePasswordResetLink(email);
        // Linki kullanıcıya email olarak göndermelisin
        System.out.println("Password reset link: " + link);
    }
}
