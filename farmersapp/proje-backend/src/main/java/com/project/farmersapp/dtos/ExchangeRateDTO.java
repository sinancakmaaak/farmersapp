package com.project.farmersapp.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ExchangeRateDTO {
    private Long id;
    private String currencyCode;
    private String currencyName;
    private BigDecimal buyingRate;
    private BigDecimal sellingRate;
    private String lastUpdated;
} 