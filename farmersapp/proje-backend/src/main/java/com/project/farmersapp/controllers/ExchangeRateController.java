package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.ExchangeRateDTO;
import com.project.farmersapp.services.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exchange-rates")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ExchangeRateController {

    private final ExchangeRateService service;

    @GetMapping
    public ResponseEntity<List<ExchangeRateDTO>> getAllRates() {
        return ResponseEntity.ok(service.getAllRates());
    }

    @PostMapping("/update")
    public ResponseEntity<Void> updateRates() {
        service.updateExchangeRates();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/add")
    public ResponseEntity<ExchangeRateDTO> addCurrency(@RequestBody ExchangeRateDTO rateDTO) {
        ExchangeRateDTO newRate = service.addCurrency(rateDTO);
        return ResponseEntity.ok(newRate);
    }

    @DeleteMapping("/{currencyCode}")
    public ResponseEntity<Void> deleteCurrency(@PathVariable String currencyCode) {
        service.deleteCurrency(currencyCode);
        return ResponseEntity.ok().build();
    }
} 