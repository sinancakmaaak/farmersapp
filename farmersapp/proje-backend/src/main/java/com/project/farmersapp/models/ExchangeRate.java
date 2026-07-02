package com.project.farmersapp.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "exchange_rates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExchangeRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String currencyCode; // USD, EUR, GBP gibi
    private String currencyName; // US Dollar, Euro, British Pound gibi
    private BigDecimal buyingRate;
    private BigDecimal sellingRate;
    private LocalDateTime lastUpdated;
} 