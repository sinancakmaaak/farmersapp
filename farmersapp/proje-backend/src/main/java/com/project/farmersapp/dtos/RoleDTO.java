package com.project.farmersapp.dtos;



import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class RoleDTO {

    @NotBlank
    private String name;
}

