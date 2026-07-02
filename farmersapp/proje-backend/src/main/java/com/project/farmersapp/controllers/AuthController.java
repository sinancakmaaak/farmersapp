package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.LoginRequestDTO;
import com.project.farmersapp.dtos.LoginResponseDTO;
import com.project.farmersapp.dtos.UserDTO;
import com.project.farmersapp.models.User;
import com.project.farmersapp.services.AuthService;
import com.project.farmersapp.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    // 🔐 Giriş işlemi - token döner
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    // 📝 Kayıt işlemi
    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody UserDTO dto) {
        User saved = userService.createUser(dto); // 🔵 HASHLEME YOK
        return ResponseEntity.ok(saved);
    }

    // 👤 Mevcut kullanıcı bilgilerini getir
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String phoneNumber = auth.getName();
        User user = userService.getUserByPhoneNumber(phoneNumber);
        return ResponseEntity.ok(user);
    }
}
