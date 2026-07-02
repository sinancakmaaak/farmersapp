// src/main/java/com/project/farmersapp/services/FertilizationService.java
package com.project.farmersapp.services;

import com.project.farmersapp.dtos.FertilizationDTO;
import com.project.farmersapp.models.Fertilization;
import com.project.farmersapp.models.Planting;
import com.project.farmersapp.models.Product;
import com.project.farmersapp.repositories.FertilizationRepository;
import com.project.farmersapp.repositories.PlantingRepository;
import com.project.farmersapp.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

// *** FACADE PATTERN *** - Fertilization Management with Business Rules
// Complex fertilization operations with product type validation
// Multiple repository coordination + business rule enforcement
@Service
@RequiredArgsConstructor
@Transactional
public class FertilizationService {

    // *** FACADE PATTERN *** - Multiple repository dependencies
    // Cross-entity relationship management (Planting, Product, Fertilization)
    private final FertilizationRepository repo;
    private final PlantingRepository plantingRepo;
    private final ProductRepository productRepo;

    /**
     * *** FACADE PATTERN *** - Complex creation workflow with business rules
     * - plantingId ile bulunan Planting'in ürün tipi ne olursa olsun alınır.
     * - productId ile bulunan Product'un tipi "Gübre" olmalı.
     */
    public FertilizationDTO create(FertilizationDTO dto) {
        // *** FACADE PATTERN *** - Multi-entity validation workflow
        // 1. Planting validation (any product type allowed)
        Planting planting = plantingRepo.findById(dto.getPlantingId())
            .orElseThrow(() -> new RuntimeException("Planting bulunamadı: " + dto.getPlantingId()));

        // 2. Product validation with business rule enforcement
        Product fertilizer = productRepo.findById(dto.getProductId())
            .orElseThrow(() -> new RuntimeException("Ürün bulunamadı: " + dto.getProductId()));
        
        // *** FACADE PATTERN *** - Business rule validation encapsulated
        if (!"Gübre".equalsIgnoreCase(fertilizer.getType())) {
            throw new IllegalArgumentException("Sadece tip = 'Gübre' olan ürün seçilebilir.");
        }

        // 3. Entity creation with Builder pattern
        Fertilization entity = Fertilization.builder()
            .date(dto.getDate())
            .planting(planting)
            .product(fertilizer)
            .build();

        return toDTO(repo.save(entity));
    }

    /** *** FACADE PATTERN *** - Simple data retrieval interface */
    @Transactional(readOnly = true)
    public List<FertilizationDTO> getAll() {
        return repo.findAll().stream()
            .map(this::toDTO) // Complex DTO transformation encapsulated
            .collect(Collectors.toList());
    }

    /** *** FACADE PATTERN *** - Simple entity access */
    @Transactional(readOnly = true)
    public FertilizationDTO getById(Long id) {
        return repo.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new RuntimeException("Gübreleme kaydı bulunamadı: " + id));
    }

    /** *** FACADE PATTERN *** - Simple deletion with validation */
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Silinecek kayıt bulunamadı: " + id);
        }
        repo.deleteById(id);
    }

    /**
     * *** FACADE PATTERN *** - Complex update workflow with business rules
     * Var olan kaydı günceller.
     * plantingId değiştirilebilir, productId yine "Gübre" tipiyle sınırlı.
     */
    public FertilizationDTO update(Long id, FertilizationDTO dto) {
        // 1. Existence validation
        Fertilization existing = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Gübreleme kaydı bulunamadı: " + id));

        // 2. Planting validation
        Planting planting = plantingRepo.findById(dto.getPlantingId())
            .orElseThrow(() -> new RuntimeException("Planting bulunamadı: " + dto.getPlantingId()));

        // 3. Product validation with business rule
        Product fertilizer = productRepo.findById(dto.getProductId())
            .orElseThrow(() -> new RuntimeException("Ürün bulunamadı: " + dto.getProductId()));
        
        // *** FACADE PATTERN *** - Business rule enforcement
        if (!"Gübre".equalsIgnoreCase(fertilizer.getType())) {
            throw new IllegalArgumentException("Sadece tip = 'Gübre' olan ürün seçilebilir.");
        }

        // 4. Entity update
        existing.setDate(dto.getDate());
        existing.setPlanting(planting);
        existing.setProduct(fertilizer);

        return toDTO(repo.save(existing));
    }

    /** *** FACADE PATTERN *** - Complex DTO transformation encapsulated */
    /** Entity → DTO dönüşümü with nested relationship data */
    private FertilizationDTO toDTO(Fertilization e) {
        FertilizationDTO dto = new FertilizationDTO();
        dto.setId(e.getId());
        dto.setDate(e.getDate());
        dto.setPlantingId(e.getPlanting().getId());
        
        // *** FACADE PATTERN *** - Complex nested data extraction
        // Planting üzerinden field/greenhouse id'leri - relationship traversal
        dto.setFieldId(e.getPlanting().getField() != null
            ? e.getPlanting().getField().getId() : null);
        dto.setGreenhouseId(e.getPlanting().getGreenhouse() != null
            ? e.getPlanting().getGreenhouse().getId() : null);
        dto.setProductId(e.getProduct().getId());  // bu artık gübre ürünü
        return dto;
    }
}
