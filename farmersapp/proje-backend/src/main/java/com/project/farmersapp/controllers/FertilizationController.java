// src/main/java/com/project/farmersapp/controllers/FertilizationController.java
package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.FertilizationDTO;
import com.project.farmersapp.services.FertilizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/fertilizations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FertilizationController {

    private static final Logger logger = LoggerFactory.getLogger(FertilizationController.class);
    private final FertilizationService service;

    @PostMapping
    public ResponseEntity<FertilizationDTO> create(@RequestBody @Valid FertilizationDTO dto) {
        logger.info("Received create fertilization request with data: {}", dto);
        FertilizationDTO created = service.create(dto);
        // Location header ekleyelim (GET /{id} endpoint'ine işaret eder)
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping
    public ResponseEntity<List<FertilizationDTO>> listAll() {
        logger.info("Received request to list all fertilizations");
        List<FertilizationDTO> fertilizations = service.getAll();
        logger.info("Found {} fertilizations", fertilizations.size());
        return ResponseEntity.ok(fertilizations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FertilizationDTO> getOne(@PathVariable Long id) {
        logger.info("Received request to get fertilization with id: {}", id);
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FertilizationDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid FertilizationDTO dto) {
        logger.info("Received update request for fertilization with id: {} and data: {}", id, dto);
        FertilizationDTO updated = service.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        logger.info("Received delete request for fertilization with id: {}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
