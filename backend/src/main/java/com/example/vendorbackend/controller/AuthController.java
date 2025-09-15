package com.example.vendorbackend.controller;

import com.example.vendorbackend.dto.LoginRequest;
import com.example.vendorbackend.dto.SignupRequest;
import com.example.vendorbackend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest request) throws Exception {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) throws Exception {
        authService.sendPasswordReset(email);
        return "Password reset link sent to " + email;
    }
}
