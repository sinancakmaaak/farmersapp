package com.project.farmersapp.repositories;

import com.project.farmersapp.models.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    ExchangeRate findByCurrencyCode(String currencyCode);
} 