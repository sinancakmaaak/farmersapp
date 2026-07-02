// src/main/java/com/project/farmersapp/dtos/DailyWeatherDTO.java
package com.project.farmersapp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DailyWeatherDTO {
    private String date;       // YYYY-MM-DD
    private Double tempMin;    // °C
    private Double tempMax;    // °C
    private Integer weatherCode; // Open-Meteo code (0=güneşli, etc.)
}
