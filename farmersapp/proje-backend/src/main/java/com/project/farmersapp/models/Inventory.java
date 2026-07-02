package com.project.farmersapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @Column(name = "invoice_number")
    private String invoiceNumber;

    @NotNull(message = "Purchase date is required")
    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @ManyToOne
    @JoinColumn(name = "supplier_company_id")
    private SupplierCompany supplierCompany;
}
