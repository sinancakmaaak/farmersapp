// src/main/java/com/project/farmersapp/services/GeocodingService.java
package com.project.farmersapp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

// *** STRATEGY PATTERN *** - Geocoding API Strategy
// External geocoding service için strategy implementation
// İleride Google Maps, MapBox gibi farklı API stratejileri eklenebilir
@Service
@RequiredArgsConstructor
public class GeocodingService {

    @Value("${weather.api.geocode-url}")
    private String geocodeUrl;

    // *** STRATEGY PATTERN *** - HTTP Client Strategy
    // RestTemplate strategy, alternatif: WebClient, OkHttp etc.
    private final RestTemplate restTemplate;

    public Coordinate lookup(String city) {
        // *** STRATEGY PATTERN *** - URL Building Strategy
        // UriComponentsBuilder strategy for query parameter handling
        String url = UriComponentsBuilder
            .fromHttpUrl(geocodeUrl)
            .queryParam("name", city)
            .queryParam("count", 1)
            .queryParam("language", "tr") // Language strategy: tr, en, etc.
            .toUriString();

        // *** STRATEGY PATTERN *** - API Response Handling Strategy
        // Current: JSON Map strategy, alternatives: XML, custom objects
        @SuppressWarnings("unchecked")
        Map<String,Object> resp = restTemplate.getForObject(url, Map.class);
        @SuppressWarnings("unchecked")
        List<Map<String,Object>> results = (List<Map<String,Object>>) resp.get("results");
        
        // *** STRATEGY PATTERN *** - Error Handling Strategy
        if (results == null || results.isEmpty()) {
            throw new RuntimeException("Şehir bulunamadı: " + city);
        }
        
        // *** STRATEGY PATTERN *** - Data Extraction Strategy
        // Current: first result strategy, alternatives: best match, user selection
        Map<String,Object> loc = results.get(0);
        double lat = ((Number)loc.get("latitude")).doubleValue();
        double lon = ((Number)loc.get("longitude")).doubleValue();
        return new Coordinate(lat, lon);
    }

    // *** STRATEGY PATTERN *** - Data Transfer Strategy
    // Record strategy for immutable coordinate representation
    public static record Coordinate(double latitude, double longitude) {}
}
