package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.GreenhouseDTO;
import com.project.farmersapp.models.Greenhouse;
import com.project.farmersapp.services.GreenhouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/greenhouses")
@RequiredArgsConstructor
public class GreenhouseController {

    private final GreenhouseService greenhouseService;

    @PostMapping
    public ResponseEntity<Greenhouse> createGreenhouse(@Valid @RequestBody GreenhouseDTO dto) {
        return ResponseEntity.ok(greenhouseService.createGreenhouse(dto));
    }

    @GetMapping
    public ResponseEntity<List<Greenhouse>> getAllGreenhouses() {
        return ResponseEntity.ok(greenhouseService.getAllGreenhouses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Greenhouse> getGreenhouseById(@PathVariable Long id) {
        return greenhouseService.getGreenhouseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Greenhouse> updateGreenhouse(@PathVariable Long id, @Valid @RequestBody GreenhouseDTO dto) {
        return ResponseEntity.ok(greenhouseService.updateGreenhouse(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGreenhouse(@PathVariable Long id) {
        greenhouseService.deleteGreenhouse(id);
        return ResponseEntity.noContent().build();
    }
}
