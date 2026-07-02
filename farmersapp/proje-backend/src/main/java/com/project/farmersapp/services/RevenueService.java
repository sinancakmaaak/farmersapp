// src/main/java/com/project/farmersapp/services/RevenueService.java
package com.project.farmersapp.services;

import com.project.farmersapp.dtos.RevenueDTO;
import com.project.farmersapp.models.Revenue;
import com.project.farmersapp.repositories.RevenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RevenueService {

    private final RevenueRepository repo;

    public RevenueDTO create(RevenueDTO dto) {
        Revenue e = Revenue.builder()
                .type(dto.getType())
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .build();
        return toDTO(repo.save(e));
    }

    public List<RevenueDTO> getAll() {
        return repo.findAll()
                   .stream()
                   .map(this::toDTO)
                   .collect(Collectors.toList());
    }

    public RevenueDTO getById(Long id) {
        return repo.findById(id)
                   .map(this::toDTO)
                   .orElseThrow(() -> new RuntimeException("Gelir kaydı bulunamadı: " + id));
    }

    public RevenueDTO update(Long id, RevenueDTO dto) {
        Revenue e = repo.findById(id)
                   .orElseThrow(() -> new RuntimeException("Gelir kaydı bulunamadı: " + id));
        e.setType(dto.getType());
        e.setAmount(dto.getAmount());
        e.setDescription(dto.getDescription());
        return toDTO(repo.save(e));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Silinecek gelir kaydı bulunamadı: " + id);
        }
        repo.deleteById(id);
    }

    private RevenueDTO toDTO(Revenue e) {
        RevenueDTO dto = new RevenueDTO();
        dto.setId(e.getId());
        dto.setType(e.getType());
        dto.setAmount(e.getAmount());
        dto.setDescription(e.getDescription());
        return dto;
    }
}
