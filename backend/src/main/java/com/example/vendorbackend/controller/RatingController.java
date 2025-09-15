package com.example.vendorbackend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rate-vendors")
public class RatingController {

    @GetMapping
    public Object getUnratedVendors(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        // Firestore'dan userId için unrated vendors döndür
        return List.of();
    }

    @PostMapping
    public Object submitRating(HttpServletRequest request, @RequestBody Map<String,Object> rating) {
        String userId = (String) request.getAttribute("userId");
        // Firestore rating kaydet ve vendor average rating güncelle
        return Map.of("status", "success");
    }
}
