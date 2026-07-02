// src/main/java/com/project/farmersapp/controllers/WeatherController.java
package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.DailyWeatherDTO;
import com.project.farmersapp.services.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    /**
     * Şehir adına göre 7 günlük tahmin.
     * Örnek: GET /api/weather/forecast?city=Ankara
     */
    @GetMapping("/forecast")
    public ResponseEntity<List<DailyWeatherDTO>> forecastByCity(
            @RequestParam String city) {
        return ResponseEntity.ok(
            weatherService.get7DayForecastByCity(city)
        );
    }
}
