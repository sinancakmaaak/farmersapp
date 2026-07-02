package com.project.farmersapp.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDTO {

    @NotBlank(message = "Telefon numarası boş olamaz")
    private String phoneNumber;

    @NotBlank(message = "Şifre boş olamaz")
    private String password;
}
