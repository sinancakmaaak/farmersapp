// src/main/java/com/project/farmersapp/dtos/SoilTestDTO.java
package com.project.farmersapp.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class SoilTestDTO {

    private Long id;

    @NotBlank(message = "Numune kodu boş bırakılamaz")
    private String sampleCode;

    @NotBlank(message = "Numune tarihi boş bırakılamaz")
    private String sampleDate;

    private Long fieldId;
    private Long greenhouseId;

    private String notes;
}
