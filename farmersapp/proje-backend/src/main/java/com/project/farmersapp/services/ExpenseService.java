// src/main/java/com/project/farmersapp/services/ExpenseService.java
package com.project.farmersapp.services;

import com.project.farmersapp.dtos.ExpenseDTO;
import com.project.farmersapp.models.Expense;
import com.project.farmersapp.models.SupplierCompany;
import com.project.farmersapp.repositories.ExpenseRepository;
import com.project.farmersapp.repositories.SupplierCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository repo;
    private final SupplierCompanyRepository supplierRepo;

    public ExpenseDTO create(ExpenseDTO dto) {
        SupplierCompany sc = null;
        if (dto.getSupplierCompanyId() != null) {
            sc = supplierRepo.findById(dto.getSupplierCompanyId())
                .orElseThrow(() ->
                    new RuntimeException("Tedarikçi şirket bulunamadı: " + dto.getSupplierCompanyId())
                );
        }

        Expense e = Expense.builder()
            .type(dto.getType())
            .amount(dto.getAmount())
            .supplierCompany(sc)
            .notes(dto.getNotes())
            .build();

        return toDTO(repo.save(e));
    }

    public List<ExpenseDTO> getAll() {
        return repo.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public ExpenseDTO getById(Long id) {
        return repo.findById(id)
            .map(this::toDTO)
            .orElseThrow(() ->
                new RuntimeException("Gider kaydı bulunamadı: " + id)
            );
    }

    public ExpenseDTO update(Long id, ExpenseDTO dto) {
        Expense e = repo.findById(id)
            .orElseThrow(() ->
                new RuntimeException("Gider kaydı bulunamadı: " + id)
            );

        SupplierCompany sc = null;
        if (dto.getSupplierCompanyId() != null) {
            sc = supplierRepo.findById(dto.getSupplierCompanyId())
                .orElseThrow(() ->
                    new RuntimeException("Tedarikçi şirket bulunamadı: " + dto.getSupplierCompanyId())
                );
        }

        e.setType(dto.getType());
        e.setAmount(dto.getAmount());
        e.setSupplierCompany(sc);
        e.setNotes(dto.getNotes());

        return toDTO(repo.save(e));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Silinecek gider kaydı bulunamadı: " + id);
        }
        repo.deleteById(id);
    }

    private ExpenseDTO toDTO(Expense e) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(e.getId());
        dto.setType(e.getType());
        dto.setAmount(e.getAmount());
        dto.setSupplierCompanyId(
            e.getSupplierCompany() != null ? e.getSupplierCompany().getId() : null
        );
        dto.setNotes(e.getNotes());
        return dto;
    }
}
    