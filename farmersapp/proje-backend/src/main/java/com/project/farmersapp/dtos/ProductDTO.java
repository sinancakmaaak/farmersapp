package com.project.farmersapp.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductDTO {

    @NotBlank(message = "Ürün adı boş olamaz")
    private String name;

    private String type;

    private String description;
}
