package com.project.farmersapp.services;

import com.project.farmersapp.dtos.IrrigationDTO;
import com.project.farmersapp.models.Field;
import com.project.farmersapp.models.Greenhouse;
import com.project.farmersapp.models.Irrigation;
import com.project.farmersapp.models.Product;
import com.project.farmersapp.repositories.FieldRepository;
import com.project.farmersapp.repositories.GreenhouseRepository;
import com.project.farmersapp.repositories.IrrigationRepository;
import com.project.farmersapp.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@Service
@RequiredArgsConstructor
@Transactional
public class IrrigationService {
    private static final Logger logger = LoggerFactory.getLogger(IrrigationService.class);

    private final IrrigationRepository irrigationRepository;
    private final FieldRepository fieldRepository;
    private final GreenhouseRepository greenhouseRepository;
    private final ProductRepository productRepository;

    public Irrigation createIrrigation(IrrigationDTO dto) {
        logger.info("Creating new irrigation with DTO: {}", dto);

        // Tarih kontrolü
        LocalDate date;
        try {
            date = LocalDate.parse(dto.getDate());
        } catch (DateTimeParseException e) {
            logger.error("Invalid date format: {}", dto.getDate());
            throw new IllegalArgumentException("Geçersiz tarih formatı. Tarih 'YYYY-MM-DD' formatında olmalıdır.");
        }

        Field field = null;
        Greenhouse greenhouse = null;
        Product product = null;

        // Tarla seçilmişse
        if (dto.getFieldId() != null && dto.getFieldId() > 0) {
            field = fieldRepository.findById(dto.getFieldId())
                    .orElseThrow(() -> {
                        logger.error("Field not found with id: {}", dto.getFieldId());
                        return new RuntimeException("Tarla bulunamadı");
                    });
        }

        // Sera seçilmişse
        if (dto.getGreenhouseId() != null && dto.getGreenhouseId() > 0) {
            greenhouse = greenhouseRepository.findById(dto.getGreenhouseId())
                    .orElseThrow(() -> {
                        logger.error("Greenhouse not found with id: {}", dto.getGreenhouseId());
                        return new RuntimeException("Sera bulunamadı");
                    });
        }

        // Ürün seçilmişse
        if (dto.getProductId() != null && dto.getProductId() > 0) {
            product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> {
                        logger.error("Product not found with id: {}", dto.getProductId());
                        return new RuntimeException("Ürün bulunamadı");
                    });
        }

        // En az bir lokasyon (tarla veya sera) seçili olmalı
        if (field == null && greenhouse == null) {
            logger.error("Neither field nor greenhouse selected");
            throw new IllegalArgumentException("Tarla veya sera seçmelisiniz");
        }

        // Ürün seçilmeli
        if (product == null) {
            logger.error("No product selected");
            throw new IllegalArgumentException("Ürün seçmelisiniz");
        }

        Irrigation irrigation = Irrigation.builder()
                .field(field)
                .greenhouse(greenhouse)
                .product(product)
                .date(date)
                .notes(dto.getNotes())
                .build();

        logger.info("Saving new irrigation: {}", irrigation);
        return irrigationRepository.save(irrigation);
    }

    @Transactional(readOnly = true)
    public Page<Irrigation> getAllIrrigations(Pageable pageable) {
        logger.info("Fetching all irrigations with pageable: {}", pageable);
        return irrigationRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Irrigation getIrrigationById(Long id) {
        logger.info("Fetching irrigation with id: {}", id);
        return irrigationRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Irrigation not found with id: {}", id);
                    return new RuntimeException("Sulama kaydı bulunamadı");
                });
    }

    public Irrigation updateIrrigation(Long id, IrrigationDTO dto) {
        logger.info("Updating irrigation with id: {} and DTO: {}", id, dto);

        Irrigation irrigation = irrigationRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Irrigation not found with id: {}", id);
                    return new RuntimeException("Kayıt bulunamadı");
                });

        // Tarih kontrolü
        LocalDate date;
        try {
            date = LocalDate.parse(dto.getDate());
        } catch (DateTimeParseException e) {
            logger.error("Invalid date format: {}", dto.getDate());
            throw new IllegalArgumentException("Geçersiz tarih formatı. Tarih 'YYYY-MM-DD' formatında olmalıdır.");
        }

        Field field = null;
        Greenhouse greenhouse = null;
        Product product = null;

        // Tarla seçilmişse
        if (dto.getFieldId() != null && dto.getFieldId() > 0) {
            field = fieldRepository.findById(dto.getFieldId())
                    .orElseThrow(() -> {
                        logger.error("Field not found with id: {}", dto.getFieldId());
                        return new RuntimeException("Tarla bulunamadı");
                    });
        }

        // Sera seçilmişse
        if (dto.getGreenhouseId() != null && dto.getGreenhouseId() > 0) {
            greenhouse = greenhouseRepository.findById(dto.getGreenhouseId())
                    .orElseThrow(() -> {
                        logger.error("Greenhouse not found with id: {}", dto.getGreenhouseId());
                        return new RuntimeException("Sera bulunamadı");
                    });
        }

        // Ürün seçilmişse
        if (dto.getProductId() != null && dto.getProductId() > 0) {
            product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> {
                        logger.error("Product not found with id: {}", dto.getProductId());
                        return new RuntimeException("Ürün bulunamadı");
                    });
        }

        // En az bir lokasyon (tarla veya sera) seçili olmalı
        if (field == null && greenhouse == null) {
            logger.error("Neither field nor greenhouse selected");
            throw new IllegalArgumentException("Tarla veya sera seçmelisiniz");
        }

        // Ürün seçilmeli
        if (product == null) {
            logger.error("No product selected");
            throw new IllegalArgumentException("Ürün seçmelisiniz");
        }

        irrigation.setField(field);
        irrigation.setGreenhouse(greenhouse);
        irrigation.setProduct(product);
        irrigation.setDate(date);
        irrigation.setNotes(dto.getNotes());

        logger.info("Saving updated irrigation: {}", irrigation);
        return irrigationRepository.save(irrigation);
    }

    public void deleteIrrigation(Long id) {
        logger.info("Deleting irrigation with id: {}", id);
        irrigationRepository.deleteById(id);
        logger.info("Irrigation deleted successfully");
    }
}
