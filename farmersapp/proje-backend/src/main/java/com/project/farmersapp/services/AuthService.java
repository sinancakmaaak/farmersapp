package com.project.farmersapp.services;

import com.project.farmersapp.dtos.LoginRequestDTO;
import com.project.farmersapp.dtos.LoginResponseDTO;
import com.project.farmersapp.models.User;
import com.project.farmersapp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

// *** FACADE PATTERN *** - Authentication işlemlerini tek noktadan yönetme
// Kompleks authentication sürecini basit interface ile dışarıya sunma
@Service
@RequiredArgsConstructor
public class AuthService {

    // *** FACADE PATTERN *** - Multiple dependencies'i tek service'de toplama
    // Client sadece AuthService ile konuşur, altta yatan kompleksliği gizler
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public LoginResponseDTO authenticate(LoginRequestDTO request) {
        // *** FACADE PATTERN *** - Complex authentication sürecini tek method'da toplama
        // 1. Authentication işlemi (AuthenticationManager)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getPhoneNumber(),
                        request.getPassword()
                )
        );

        // 2. JWT token oluşturma (JwtUtil)
        String token = jwtUtil.generateToken(authentication.getName());
        
        // 3. User bilgilerini getirme (UserService)
        User user = userService.getUserByPhoneNumber(authentication.getName());
        
        // 4. Response DTO oluşturma ve dönme
        // Client için tek satırda authentication tamamlanıyor
        return LoginResponseDTO.fromUser(user, token);
    }
}
