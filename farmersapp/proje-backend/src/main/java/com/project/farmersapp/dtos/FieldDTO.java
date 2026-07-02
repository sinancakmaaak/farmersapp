package com.project.farmersapp.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class FieldDTO {

    @NotBlank
    private String name;

    private String location;

    @PositiveOrZero
    private double area;

    private String soilType;

    private String notes;
}