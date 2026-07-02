// src/main/java/com/project/farmersapp/controllers/PesticideController.java
package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.PesticideDTO;
import com.project.farmersapp.services.PesticideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/pesticides")
@RequiredArgsConstructor
public class PesticideController {

    private final PesticideService service;

    @PostMapping
    public ResponseEntity<PesticideDTO> create(@RequestBody @Valid PesticideDTO dto) {
        PesticideDTO created = service.create(dto);
        URI loc = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
        return ResponseEntity.created(loc).body(created);
    }

    @GetMapping
    public ResponseEntity<List<PesticideDTO>> listAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PesticideDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PesticideDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid PesticideDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
