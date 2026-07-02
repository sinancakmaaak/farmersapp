// src/main/java/com/project/farmersapp/dtos/FertilizationDTO.java
package com.project.farmersapp.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class FertilizationDTO {

    private Long id;

    @NotBlank(message = "Gübreleme tarihi boş bırakılamaz")
    private String date;

    @NotNull(message = "plantingId gerekli")
    private Long plantingId;

    // burada fieldId ve greenhouseId sadece okunur, validate edilmez
    private Long fieldId;
    private Long greenhouseId;

    @NotNull(message = "productId gerekli")
    private Long productId;
}
