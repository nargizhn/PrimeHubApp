package com.example.vendorbackend.controller;

import com.example.vendorbackend.model.Vendor;
import com.example.vendorbackend.service.RatingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rate-vendors")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping
    public Object getUnratedVendors(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        // Firestore'dan userId için unrated vendors döndür (gelecekte)
        return List.of();
    }

    @PostMapping
    public ResponseEntity<Vendor> submitRating(HttpServletRequest request, @RequestBody Map<String,Object> body) {
        String userId = (String) request.getAttribute("userId");
        String vendorId = (String) body.get("vendorId");
        Object valueObj = body.get("rating");
        if (userId == null || vendorId == null || valueObj == null) {
            return ResponseEntity.badRequest().build();
        }
        double value = ((Number) valueObj).doubleValue();
        Vendor updated = ratingService.submitRating(userId, vendorId, value);
        return ResponseEntity.ok(updated);
    }
}
