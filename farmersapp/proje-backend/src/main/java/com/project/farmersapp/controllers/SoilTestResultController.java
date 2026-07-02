package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.SoilTestResultDTO;
import com.project.farmersapp.services.SoilTestResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/soil-test-results")
@RequiredArgsConstructor
public class SoilTestResultController {

    private final SoilTestResultService service;

    @PostMapping
    public ResponseEntity<SoilTestResultDTO> create(@RequestBody @Valid SoilTestResultDTO dto) {
        SoilTestResultDTO created = service.create(dto);
        URI loc = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
        return ResponseEntity.created(loc).body(created);
    }

    @GetMapping
    public ResponseEntity<List<SoilTestResultDTO>> listAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SoilTestResultDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SoilTestResultDTO> update(
        @PathVariable Long id,
        @RequestBody @Valid SoilTestResultDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}