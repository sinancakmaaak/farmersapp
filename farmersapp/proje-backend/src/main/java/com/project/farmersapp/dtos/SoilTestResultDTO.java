// src/main/java/com/project/farmersapp/dtos/SoilTestResultDTO.java
package com.project.farmersapp.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Data
public class SoilTestResultDTO {

    private Long id;

    @NotNull(message = "soilTestId gerekli")
    private Long soilTestId;

    @NotBlank(message = "Parametre adı boş bırakılamaz")
    private String parameter;

    @NotNull(message = "Değer boş bırakılamaz")
    private BigDecimal value;

    
    private String unit;

    
    private String sampleCode;
}   

