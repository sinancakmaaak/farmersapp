// src/main/java/com/project/farmersapp/services/WeatherService.java
package com.project.farmersapp.services;

import com.project.farmersapp.dtos.DailyWeatherDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

// *** FACADE PATTERN *** - External weather API operations için unified interface
// Complex external service integration'ı basit method call'a dönüştürme
@Service
@RequiredArgsConstructor
public class WeatherService {

    @Value("${weather.api.forecast-url}")
    private String forecastUrl;

    @Value("${weather.api.timezone}")
    private String timezone;

    // *** FACADE PATTERN *** - Multiple external dependencies'i encapsulate etme
    private final RestTemplate restTemplate; // HTTP client
    private final GeocodingService geocodingService; // Location service

    @SuppressWarnings("unchecked")
    public List<DailyWeatherDTO> get7DayForecastByCity(String city) {
        // *** FACADE PATTERN *** - Complex external API workflow'u tek method'da
        
        // 1. City to coordinates conversion (GeocodingService facade)
        GeocodingService.Coordinate coord = geocodingService.lookup(city);

        // 2. Weather API URL building (UriComponentsBuilder)
        String url = UriComponentsBuilder
            .fromHttpUrl(forecastUrl)
            .queryParam("latitude", coord.latitude())
            .queryParam("longitude", coord.longitude())
            .queryParam("daily", "temperature_2m_max,temperature_2m_min,weathercode")
            .queryParam("timezone", timezone)
            .toUriString();

        // 3. External API call (RestTemplate)
        Map<String,Object> resp = restTemplate.getForObject(url, Map.class);
        Map<String,Object> daily = (Map<String,Object>) resp.get("daily");

        // 4. Raw data extraction
        List<String> dates    = (List<String>) daily.get("time");
        List<Double> mins     = (List<Double>) daily.get("temperature_2m_min");
        List<Double> maxs     = (List<Double>) daily.get("temperature_2m_max");
        List<Integer> codes   = (List<Integer>) daily.get("weathercode");

        // 5. DTO transformation and return
        // Client sadece city name veriyor, complex API integration gizleniyor
        List<DailyWeatherDTO> result = new ArrayList<>();
        for (int i = 0; i < dates.size(); i++) {
            result.add(new DailyWeatherDTO(
                dates.get(i),
                mins.get(i),
                maxs.get(i),
                codes.get(i)
            ));
        }
        return result;
    }
}
