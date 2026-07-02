
package com.project.farmersapp.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class RevenueDTO {

    private Long id;

    @NotBlank(message = "Gelir türü boş bırakılamaz")
    private String type;

    @NotNull(message = "Miktar (amount) gerekli")
    private BigDecimal amount;

    private String description;
}
