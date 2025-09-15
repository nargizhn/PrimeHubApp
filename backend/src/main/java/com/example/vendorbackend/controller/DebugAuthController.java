// DebugAuthController.java
package com.example.vendorbackend.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/_debug")
public class DebugAuthController {

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "missing_or_bad_authorization"));
        }
        String idToken = auth.substring(7).trim();
        try {
            FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);
            return ResponseEntity.ok(Map.of(
                    "uid", decoded.getUid(),
                    "issuer", decoded.getIssuer(),
                    "claims", decoded.getClaims()
            ));
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(401).body(Map.of(
                    "error", "verify_failed",
                    "code", e.getAuthErrorCode() != null ? e.getAuthErrorCode().name() : "UNKNOWN",
                    "message", e.getMessage()
            ));
        }
    }
}
