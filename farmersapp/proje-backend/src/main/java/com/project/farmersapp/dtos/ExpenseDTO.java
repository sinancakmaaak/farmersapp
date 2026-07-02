
package com.project.farmersapp.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class ExpenseDTO {

    private Long id;

    @NotBlank(message = "Gider türü boş bırakılamaz")
    private String type;

    @NotNull(message = "Miktar (amount) gerekli")
    private BigDecimal amount;

    // Opsiyonel, gönderilmezse null kalır
    private Long supplierCompanyId;

    private String notes;
}
