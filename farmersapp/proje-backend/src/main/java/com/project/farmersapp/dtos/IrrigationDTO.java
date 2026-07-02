package com.project.farmersapp.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IrrigationDTO {
    private Long id;
    
    private Long fieldId;
    
    private Long greenhouseId;
    
    @NotNull(message = "Ürün seçimi zorunludur")
    private Long productId;
    
    @NotNull(message = "Tarih seçimi zorunludur")
    private String date;
    
    private String notes;
}
