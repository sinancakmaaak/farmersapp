package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.InventoryDTO;
import com.project.farmersapp.models.Inventory;
import com.project.farmersapp.services.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    public ResponseEntity<InventoryDTO> createInventory(@Valid @RequestBody InventoryDTO dto) {
        Inventory inventory = inventoryService.createInventory(dto);
        return ResponseEntity.ok(inventoryService.mapToDto(inventory));
    }

    @GetMapping
    public ResponseEntity<List<InventoryDTO>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryDTO> getInventoryById(@PathVariable Long id) {
        return inventoryService.getInventoryById(id)
                .map(inventory -> ResponseEntity.ok(inventoryService.mapToDto(inventory)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryDTO> updateInventory(@PathVariable Long id, @Valid @RequestBody InventoryDTO dto) {
        Inventory inventory = inventoryService.updateInventory(id, dto);
        return ResponseEntity.ok(inventoryService.mapToDto(inventory));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }
}
