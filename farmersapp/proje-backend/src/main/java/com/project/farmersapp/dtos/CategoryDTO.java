package com.project.farmersapp.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class CategoryDTO {

    @NotBlank
    private String name;

    private String description;
}
