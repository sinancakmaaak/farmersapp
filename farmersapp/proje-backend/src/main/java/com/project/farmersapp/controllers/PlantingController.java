package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.PlantingDTO;
import com.project.farmersapp.models.Planting;
import com.project.farmersapp.services.PlantingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plantings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PlantingController {

    private static final Logger logger = LoggerFactory.getLogger(PlantingController.class);
    private final PlantingService plantingService;

    @PostMapping
    public ResponseEntity<?> createPlanting(@Valid @RequestBody PlantingDTO dto) {
        try {
            logger.info("Received planting creation request: {}", dto);
            Planting planting = plantingService.createPlanting(dto);
            logger.info("Successfully created planting with ID: {}", planting.getId());
            return ResponseEntity.ok(planting);
        } catch (Exception e) {
            logger.error("Error creating planting: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Ekim/dikim oluşturulurken hata oluştu: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<Page<Planting>> getAllPlantings(Pageable pageable) {
        logger.info("Fetching all plantings with pageable: {}", pageable);
        Page<Planting> plantings = plantingService.getAllPlantings(pageable);
        logger.info("Found {} plantings", plantings.getTotalElements());
        return ResponseEntity.ok(plantings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPlantingById(@PathVariable Long id) {
        try {
            logger.info("Fetching planting with ID: {}", id);
            Planting planting = plantingService.getPlantingById(id);
            logger.info("Successfully fetched planting with ID: {}", id);
            return ResponseEntity.ok(planting);
        } catch (Exception e) {
            logger.error("Error fetching planting: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Ekim/dikim kaydı bulunamadı: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlanting(@PathVariable Long id, @Valid @RequestBody PlantingDTO dto) {
        try {
            logger.info("Received planting update request for ID {}: {}", id, dto);
            logger.info("Update DTO - productId: {}, fieldId: {}, greenhouseId: {}, quantity: {}, plantedArea: {}, plantingDate: {}, notes: {}",
                dto.getProductId(), dto.getFieldId(), dto.getGreenhouseId(), dto.getQuantity(),
                dto.getPlantedArea(), dto.getPlantingDate(), dto.getNotes());

            Planting planting = plantingService.updatePlanting(id, dto);
            logger.info("Successfully updated planting with ID: {}", planting.getId());
            return ResponseEntity.ok(planting);
        } catch (Exception e) {
            logger.error("Error updating planting: {}", e.getMessage(), e);
            logger.error("Full error details:", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Ekim/dikim güncellenirken hata oluştu: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<?> deletePlanting(@PathVariable Long id) {
        try {
            logger.info("Received planting deletion request for ID: {}", id);
            plantingService.deletePlanting(id);
            logger.info("Successfully deleted planting with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting planting: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Ekim/dikim silinirken hata oluştu: " + e.getMessage()));
        }
    }

    private static class ErrorResponse {
        private final String message;
        private String details;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public ErrorResponse(String message, String details) {
            this.message = message;
            this.details = details;
        }

        public String getMessage() {
            return message;
        }

        public String getDetails() {
            return details;
        }

        public void setDetails(String details) {
            this.details = details;
        }
    }
}
