package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.SupplierCompanyDTO;
import com.project.farmersapp.models.SupplierCompany;
import com.project.farmersapp.services.SupplierCompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier-companies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SupplierCompanyController {

    private final SupplierCompanyService supplierCompanyService;

    @PostMapping
    public ResponseEntity<SupplierCompany> createSupplierCompany(@Valid @RequestBody SupplierCompanyDTO dto) {
        return ResponseEntity.ok(supplierCompanyService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<SupplierCompanyDTO>> getAllSupplierCompanies() {
        return ResponseEntity.ok(supplierCompanyService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierCompany> getSupplierCompanyById(@PathVariable Long id) {
        return supplierCompanyService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierCompany> updateSupplierCompany(@PathVariable Long id, @Valid @RequestBody SupplierCompanyDTO dto) {
        return ResponseEntity.ok(supplierCompanyService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplierCompany(@PathVariable Long id) {
        supplierCompanyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
