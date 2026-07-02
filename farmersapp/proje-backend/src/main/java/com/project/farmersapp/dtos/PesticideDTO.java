// src/main/java/com/project/farmersapp/dtos/PesticideDTO.java
package com.project.farmersapp.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// src/main/java/com/project/farmersapp/dtos/PesticideDTO.java
@JsonIgnoreProperties(value = { "id","fieldId","greenhouseId","productId" }, allowGetters = true)
@Data
public class PesticideDTO {
    private Long id;

    @NotBlank(message = "Kimyasal adı boş bırakılamaz")
    private String chemical;

    @NotBlank(message = "Uygulama tarihi boş bırakılamaz")
    private String applicationDate;

    @NotNull(message = "plantingId gerekli")
    private Long plantingId;

    private Long productId;
    private Long fieldId;
    private Long greenhouseId;
    private String notes;
}


