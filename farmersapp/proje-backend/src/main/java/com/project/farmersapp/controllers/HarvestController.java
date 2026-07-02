package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.HarvestDTO;
import com.project.farmersapp.models.Harvest;
import com.project.farmersapp.services.HarvestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/harvests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class HarvestController {

    private final HarvestService harvestService;
    private static final Logger log = LoggerFactory.getLogger(HarvestController.class);

    @PostMapping
    public ResponseEntity<?> create(@RequestBody @Valid HarvestDTO dto, BindingResult bindingResult) {
        log.info("Received create harvest request with data: {}", dto);

        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.joining(", "));
            log.error("Validation errors: {}", errors);
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Validasyon hatası: " + errors));
        }

        try {
            Harvest createdHarvest = harvestService.createHarvest(dto);
            log.info("Successfully created harvest with ID: {}", createdHarvest.getId());
            return ResponseEntity.ok(createdHarvest);
        } catch (IllegalArgumentException e) {
            log.error("Invalid input data: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Geçersiz veri: " + e.getMessage()));
        } catch (RuntimeException e) {
            log.error("Runtime error while creating harvest: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Hasat kaydı oluşturulurken hata oluştu: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error while creating harvest: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Beklenmeyen bir hata oluştu: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<HarvestDTO>> getAll() {
        return ResponseEntity.ok(harvestService.getAllHarvests());
    }

    @PostMapping("/{id}/update")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody @Valid HarvestDTO dto, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Validasyon hatası: " + errors));
        }

        try {
            return ResponseEntity.ok(harvestService.updateHarvest(id, dto));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Hasat güncellenirken hata oluştu: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        log.info("Received delete request for harvest ID: {}", id);
        try {
            // ID'nin geçerliliğini kontrol et
            if (id == null || id <= 0) {
                log.error("Invalid harvest ID: {}", id);
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Geçersiz hasat ID'si"));
            }

            // Önce kaydın var olup olmadığını kontrol et
            boolean exists = harvestService.existsById(id);
            log.info("Harvest exists check for ID {}: {}", id, exists);

            if (!exists) {
                log.error("Harvest not found with ID: {}", id);
                return ResponseEntity.status(404)
                    .body(new ErrorResponse("Hasat kaydı bulunamadı: " + id));
            }

            
            harvestService.deleteHarvest(id);
            log.info("Successfully deleted harvest with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error while deleting harvest with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(new ErrorResponse("Hasat silinirken hata oluştu: " + e.getMessage()));
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
