package com.project.farmersapp.config;

import com.project.farmersapp.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    private static final String[] SWAGGER_WHITELIST = {
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/swagger-resources/**",
        "/webjars/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(SWAGGER_WHITELIST).permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/photos/*/view").permitAll()
                .requestMatchers("/api/photos/*/download").permitAll()
                .requestMatchers("/api/invoices/*/download").permitAll()
                .requestMatchers("/api/documents/*/download").permitAll()
                .requestMatchers("/api/greenhouses/**").authenticated()
                .requestMatchers("/api/harvests/**").authenticated()
                .requestMatchers("/api/pesticides/**").authenticated()
                .requestMatchers("/api/plantings/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/harvests/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/harvests/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/harvests/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/harvests/**").authenticated()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        // *** STRATEGY PATTERN *** - Authentication strategy seçimi
        // DaoAuthenticationProvider, AuthenticationProvider interface'inin concrete strategy'si
        // Farklı authentication strategy'leri (LDAP, OAuth, JWT etc.) aynı interface'i implement eder
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider; // Strategy pattern ile authentication algoritması belirleniyor
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        // *** STRATEGY PATTERN *** - AuthenticationManager, farklı authentication stratejilerini yönetir
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // *** STRATEGY PATTERN *** - Password encoding strategy seçimi
        // NoOpPasswordEncoder, BCryptPasswordEncoder, etc. - farklı encoding stratejileri
        return NoOpPasswordEncoder.getInstance(); // Using NoOp as per existing configuration
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 