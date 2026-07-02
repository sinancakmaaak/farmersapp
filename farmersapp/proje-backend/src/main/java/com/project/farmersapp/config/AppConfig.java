// src/main/java/com/project/farmersapp/config/AppConfig.java
package com.project.farmersapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

// *** STRATEGY PATTERN *** - Configuration Strategy
// Centralized bean configuration strategy
@Configuration
@EnableScheduling // *** STRATEGY PATTERN *** - Scheduling Strategy activation
public class AppConfig {
    
    // *** STRATEGY PATTERN *** - HTTP Client Strategy Configuration
    // RestTemplate bean strategy - could be replaced with WebClient strategy
    // Different HTTP client strategies: RestTemplate, WebClient, OkHttp, Apache HttpClient
    @Bean
    public RestTemplate restTemplate() {
        // *** STRATEGY PATTERN *** - RestTemplate configuration strategy
        // Default configuration strategy - no custom interceptors, timeouts etc.
        // Could be enhanced with different strategies: authentication, retry, logging
        return new RestTemplate();
    }
    
    // *** STRATEGY PATTERN *** - Future Bean Strategies
    // Potential for additional bean strategies:
    // - ObjectMapper configuration strategy
    // - Executor service strategy  
    // - Cache manager strategy
    // - Security configuration strategy
}
