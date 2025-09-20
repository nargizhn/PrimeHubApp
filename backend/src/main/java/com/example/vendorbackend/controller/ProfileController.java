package com.example.vendorbackend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @GetMapping
    public Object getProfile(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        // Firestore'dan user bilgilerini çek ve dön
        return Map.of("userId", userId, "role", role, "firstName", "Orkhan", "lastName", "Rahimli", "email", "user@example.com");
    }

    @PostMapping
    public Object updateProfile(HttpServletRequest request, @RequestBody Map<String,String> updates) {
        // String userId = (String) request.getAttribute("userId");
        // Firestore update logic
        return Map.of("status", "success");
    }
}
