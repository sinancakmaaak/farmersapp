
package com.project.farmersapp.dtos;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeDTO {

    private Long id;

    @NotBlank(message = "Ad Soyad boş olamaz")
    private String fullName;

    @Email(message = "Geçerli bir e-posta girin")
    @NotBlank(message = "E-posta boş olamaz")
    private String email;

    private String phoneNumber;

    @NotNull(message = "Maaş (salary) gerekli")
    private BigDecimal salary;

    @NotBlank(message = "Pozisyon (position) boş olamaz")
    private String position;

    @NotNull(message = "İşe başlama tarihi (hireDate) gerekli")
    private LocalDate hireDate;
}
