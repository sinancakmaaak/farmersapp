package com.project.farmersapp.services;

import com.project.farmersapp.dtos.PlantingDTO;
import com.project.farmersapp.models.Field;
import com.project.farmersapp.models.Greenhouse;
import com.project.farmersapp.models.Planting;
import com.project.farmersapp.models.Product;
import com.project.farmersapp.repositories.FieldRepository;
import com.project.farmersapp.repositories.GreenhouseRepository;
import com.project.farmersapp.repositories.PlantingRepository;
import com.project.farmersapp.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

// *** FACADE PATTERN *** - Complex planting operations için unified interface
// Multiple repository ve business logic'i tek service'de toplama
@Service
@RequiredArgsConstructor
@Transactional
public class PlantingService {
    private static final Logger logger = LoggerFactory.getLogger(PlantingService.class);

    // *** FACADE PATTERN *** - Multiple data sources'i tek interface'den yönetme
    // Client sadece PlantingService ile konuşur, repository complexity'i gizlenir
    private final PlantingRepository plantingRepository;
    private final ProductRepository productRepository;
    private final FieldRepository fieldRepository;
    private final GreenhouseRepository greenhouseRepository;

    public Planting createPlanting(PlantingDTO dto) {
        logger.info("Creating new planting with DTO: {}", dto);

        // *** FACADE PATTERN *** - Multiple validation ve business logic'i tek method'da
        // 1. Product validation
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));

        Field field = null;
        Greenhouse greenhouse = null;

        // 2. Field validation (if selected)
        if (dto.getFieldId() != null && dto.getFieldId() > 0) {
            field = fieldRepository.findById(dto.getFieldId())
                    .orElseThrow(() -> new RuntimeException("Tarla bulunamadı"));
        }

        // 3. Greenhouse validation (if selected)
        if (dto.getGreenhouseId() != null && dto.getGreenhouseId() > 0) {
            greenhouse = greenhouseRepository.findById(dto.getGreenhouseId())
                    .orElseThrow(() -> new RuntimeException("Sera bulunamadı"));
        }

        // 4. Business rule validation
        if (field == null && greenhouse == null) {
            throw new RuntimeException("Tarla veya sera seçmelisiniz");
        }

        // *** BUILDER PATTERN *** - Complex Planting object creation
        Planting planting = Planting.builder()
                .product(product)
                .field(field)
                .greenhouse(greenhouse)
                .quantity(dto.getQuantity())
                .plantedArea(dto.getPlantedArea())
                .plantingDate(dto.getPlantingDate())
                .notes(dto.getNotes())
                .build();

        logger.info("Saving new planting: {}", planting);
        return plantingRepository.save(planting);
    }

    @Transactional(readOnly = true)
    public Page<Planting> getAllPlantings(Pageable pageable) {
        logger.info("Fetching all plantings with pageable: {}", pageable);
        return plantingRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Planting getPlantingById(Long id) {
        logger.info("Fetching planting with id: {}", id);
        return plantingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ekim/dikim kaydı bulunamadı"));
    }

    public Planting updatePlanting(Long id, PlantingDTO dto) {
        logger.info("Updating planting with id: {} and DTO: {}", id, dto);

        if (id == null) {
            throw new IllegalArgumentException("ID boş olamaz");
        }

        if (dto.getProductId() == null) {
            throw new IllegalArgumentException("Ürün seçilmelidir");
        }

        Planting planting = plantingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kayıt bulunamadı"));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));

        Field field = null;
        Greenhouse greenhouse = null;

        // Tarla seçilmişse
        if (dto.getFieldId() != null) {
            field = fieldRepository.findById(dto.getFieldId())
                    .orElseThrow(() -> new RuntimeException("Tarla bulunamadı"));
        }

        // Sera seçilmişse
        if (dto.getGreenhouseId() != null) {
            greenhouse = greenhouseRepository.findById(dto.getGreenhouseId())
                    .orElseThrow(() -> new RuntimeException("Sera bulunamadı"));
        }

        // En az bir lokasyon (tarla veya sera) seçili olmalı
        if (field == null && greenhouse == null) {
            throw new RuntimeException("Tarla veya sera seçmelisiniz");
        }

        // Hem tarla hem sera seçili olmamalı
        if (field != null && greenhouse != null) {
            throw new RuntimeException("Aynı anda hem tarla hem sera seçemezsiniz");
        }

        // Validate other required fields
        if (dto.getQuantity() == null) {
            throw new IllegalArgumentException("Miktar boş olamaz");
        }

        if (dto.getPlantedArea() == null) {
            throw new IllegalArgumentException("Alan boş olamaz");
        }

        if (dto.getPlantingDate() == null) {
            throw new IllegalArgumentException("Ekim tarihi boş olamaz");
        }

        planting.setProduct(product);
        planting.setField(field);
        planting.setGreenhouse(greenhouse);
        planting.setQuantity(dto.getQuantity());
        planting.setPlantedArea(dto.getPlantedArea());
        planting.setPlantingDate(dto.getPlantingDate());
        planting.setNotes(dto.getNotes());

        logger.info("Saving updated planting: {}", planting);
        return plantingRepository.save(planting);
    }

    @Transactional
    public void deletePlanting(Long id) {
        logger.info("Deleting planting with id: {}", id);
        
        if (id == null) {
            throw new IllegalArgumentException("Planting ID cannot be null");
        }

        try {
            Planting planting = plantingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Planting not found with ID: " + id));

            // Hasat kayıtlarının planting referansını null yap
            if (planting.getHarvests() != null) {
                planting.getHarvests().forEach(harvest -> harvest.setPlanting(null));
            }

            plantingRepository.delete(planting);
            logger.info("Planting deleted successfully");
        } catch (Exception e) {
            logger.error("Error while deleting planting: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete planting: " + e.getMessage());
        }
    }
}
