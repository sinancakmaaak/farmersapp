package com.project.farmersapp.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryDTO {
    private Long id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    private String invoiceNumber;
    
    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;
    
    private Long supplierCompanyId;
    
    private SupplierCompanyDTO supplierCompany;
}
