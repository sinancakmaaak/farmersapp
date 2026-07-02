package com.project.farmersapp.dtos;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlantingDTO {
    private Long id;
    private Long productId;
    private Long fieldId;
    private Long greenhouseId;
    private Long quantity;
    private Double plantedArea;
    private LocalDate plantingDate;
    private String notes;
    
}
