package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.IrrigationDTO;
import com.project.farmersapp.models.Irrigation;
import com.project.farmersapp.services.IrrigationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/irrigations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class IrrigationController {
    private static final Logger logger = LoggerFactory.getLogger(IrrigationController.class);
    
    private final IrrigationService irrigationService;

    @GetMapping
    public ResponseEntity<Page<Irrigation>> getAllIrrigations(Pageable pageable) {
        logger.info("Fetching all irrigations with pageable: {}", pageable);
        return ResponseEntity.ok(irrigationService.getAllIrrigations(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Irrigation> getIrrigationById(@PathVariable Long id) {
        logger.info("Fetching irrigation with id: {}", id);
        return ResponseEntity.ok(irrigationService.getIrrigationById(id));
    }

    @PostMapping
    public ResponseEntity<?> createIrrigation(@RequestBody IrrigationDTO irrigationDTO) {
        try {
            logger.info("Creating new irrigation with DTO: {}", irrigationDTO);
            Irrigation irrigation = irrigationService.createIrrigation(irrigationDTO);
            logger.info("Successfully created irrigation with ID: {}", irrigation.getId());
            return ResponseEntity.ok(irrigation);
        } catch (Exception e) {
            logger.error("Error creating irrigation: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Sulama kaydı oluşturulurken hata oluştu: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIrrigation(@PathVariable Long id, @RequestBody IrrigationDTO irrigationDTO) {
        try {
            logger.info("Updating irrigation with id: {} and DTO: {}", id, irrigationDTO);
            Irrigation irrigation = irrigationService.updateIrrigation(id, irrigationDTO);
            logger.info("Successfully updated irrigation with ID: {}", irrigation.getId());
            return ResponseEntity.ok(irrigation);
        } catch (Exception e) {
            logger.error("Error updating irrigation: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Sulama kaydı güncellenirken hata oluştu: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIrrigation(@PathVariable Long id) {
        try {
            logger.info("Deleting irrigation with id: {}", id);
            irrigationService.deleteIrrigation(id);
            logger.info("Successfully deleted irrigation with ID: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting irrigation: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Sulama kaydı silinirken hata oluştu: " + e.getMessage()));
        }
    }

    private static class ErrorResponse {
        private final String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }
}
