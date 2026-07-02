package com.project.farmersapp.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class HarvestDTO {
    private Long id;

    @NotNull(message = "Miktar boş olamaz")
    @Positive(message = "Miktar pozitif bir sayı olmalıdır")
    private Double quantity;

    @NotNull(message = "Birim boş olamaz")
    private String unit;

    @NotNull(message = "Tarih boş olamaz")
    private String date;

    @NotNull(message = "Ekim ID boş olamaz")
    private Long plantingId;
}
