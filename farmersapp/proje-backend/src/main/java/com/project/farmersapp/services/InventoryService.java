package com.project.farmersapp.services;

import com.project.farmersapp.dtos.InventoryDTO;
import com.project.farmersapp.dtos.SupplierCompanyDTO;
import com.project.farmersapp.models.Inventory;
import com.project.farmersapp.models.SupplierCompany;
import com.project.farmersapp.repositories.InventoryRepository;
import com.project.farmersapp.repositories.SupplierCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// *** FACADE PATTERN *** - Inventory Management Facade
// Complex inventory operations için unified interface
// Multiple repository operations ve DTO transformations'ı tek noktada
@Service
@RequiredArgsConstructor
public class InventoryService {

    // *** FACADE PATTERN *** - Multiple repository dependencies
    // Client sadece InventoryService ile konuşur, repository complexity gizlenir
    private final InventoryRepository inventoryRepository;
    private final SupplierCompanyRepository supplierCompanyRepository;

    public Inventory createInventory(InventoryDTO dto) {
        // *** FACADE PATTERN *** - Complex creation workflow hidden from client
        // 1. Optional supplier validation
        SupplierCompany supplierCompany = null;
        if (dto.getSupplierCompanyId() != null) {
            supplierCompany = supplierCompanyRepository.findById(dto.getSupplierCompanyId())
                    .orElseThrow(() -> new RuntimeException("Tedarikçi bulunamadı"));
        }

        // 2. Entity building with Builder pattern
        Inventory inventory = Inventory.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .invoiceNumber(dto.getInvoiceNumber())
                .purchaseDate(dto.getPurchaseDate())
                .supplierCompany(supplierCompany)
                .build();

        // 3. Persistence operation
        return inventoryRepository.save(inventory);
    }

    public List<InventoryDTO> getAllInventories() {
        // *** FACADE PATTERN *** - Data retrieval and transformation facade
        // Repository call + DTO mapping + Collection processing - all hidden
        return inventoryRepository.findAll().stream()
                .map(this::mapToDto) // Complex mapping logic encapsulated
                .collect(Collectors.toList());
    }

    public Optional<Inventory> getInventoryById(Long id) {
        // *** FACADE PATTERN *** - Simple data access interface
        return inventoryRepository.findById(id);
    }

    public Inventory updateInventory(Long id, InventoryDTO dto) {
        // *** FACADE PATTERN *** - Complex update workflow
        // 1. Existence validation
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kayıt bulunamadı"));

        // 2. Field updates
        inventory.setName(dto.getName());
        inventory.setDescription(dto.getDescription());
        inventory.setInvoiceNumber(dto.getInvoiceNumber());
        inventory.setPurchaseDate(dto.getPurchaseDate());

        // 3. Optional supplier relationship management
        if (dto.getSupplierCompanyId() != null) {
            SupplierCompany supplierCompany = supplierCompanyRepository.findById(dto.getSupplierCompanyId())
                    .orElseThrow(() -> new RuntimeException("Tedarikçi bulunamadı"));
            inventory.setSupplierCompany(supplierCompany);
        } else {
            inventory.setSupplierCompany(null);
        }

        // 4. Persistence
        return inventoryRepository.save(inventory);
    }

    public void deleteInventory(Long id) {
        // *** FACADE PATTERN *** - Simple deletion interface
        inventoryRepository.deleteById(id);
    }

    // *** FACADE PATTERN *** - Complex DTO mapping logic encapsulated
    // Client doesn't need to know about DTO transformation complexity
    public InventoryDTO mapToDto(Inventory inventory) {
        // Complex nested DTO creation for supplier relationship
        SupplierCompanyDTO supplierCompanyDTO = null;
        if (inventory.getSupplierCompany() != null) {
            SupplierCompany supplier = inventory.getSupplierCompany();
            supplierCompanyDTO = SupplierCompanyDTO.builder()
                    .id(supplier.getId())
                    .companyName(supplier.getCompanyName())
                    .contactPerson(supplier.getContactPerson())
                    .email(supplier.getEmail())
                    .phoneNumber(supplier.getPhoneNumber())
                    .address(supplier.getAddress())
                    .build();
        }

        // Main DTO creation with nested supplier DTO
        return InventoryDTO.builder()
                .id(inventory.getId())
                .name(inventory.getName())
                .description(inventory.getDescription())
                .invoiceNumber(inventory.getInvoiceNumber())
                .purchaseDate(inventory.getPurchaseDate())
                .supplierCompanyId(inventory.getSupplierCompany() != null ? inventory.getSupplierCompany().getId() : null)
                .supplierCompany(supplierCompanyDTO)
                .build();
    }
}
