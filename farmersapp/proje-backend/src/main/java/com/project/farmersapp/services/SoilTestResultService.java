// src/main/java/com/project/farmersapp/services/SoilTestResultService.java
package com.project.farmersapp.services;

import com.project.farmersapp.dtos.SoilTestResultDTO;
import com.project.farmersapp.models.SoilTest;
import com.project.farmersapp.models.SoilTestResult;
import com.project.farmersapp.repositories.SoilTestRepository;
import com.project.farmersapp.repositories.SoilTestResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SoilTestResultService {

    private final SoilTestResultRepository repo;
    private final SoilTestRepository soilTestRepo;

    public SoilTestResultDTO create(SoilTestResultDTO dto) {
        SoilTest st = soilTestRepo.findById(dto.getSoilTestId())
            .orElseThrow(() -> new RuntimeException("Toprak testi bulunamadı: " + dto.getSoilTestId()));

        SoilTestResult e = SoilTestResult.builder()
            .soilTest(st)
            .parameter(dto.getParameter())
            .value(dto.getValue())
            .unit(dto.getUnit())
            .build();

        return toDTO(repo.save(e));
    }

    public List<SoilTestResultDTO> getAll() {
        return repo.findAll()
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public SoilTestResultDTO getById(Long id) {
        return repo.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new RuntimeException("Sonuç bulunamadı: " + id));
    }

    public SoilTestResultDTO update(Long id, SoilTestResultDTO dto) {
        SoilTestResult e = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Sonuç bulunamadı: " + id));

        SoilTest st = soilTestRepo.findById(dto.getSoilTestId())
            .orElseThrow(() -> new RuntimeException("Toprak testi bulunamadı: " + dto.getSoilTestId()));

        e.setSoilTest(st);
        e.setParameter(dto.getParameter());
        e.setValue(dto.getValue());
        e.setUnit(dto.getUnit());

        return toDTO(repo.save(e));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Silinecek sonuç bulunamadı: " + id);
        }
        repo.deleteById(id);
    }

    private SoilTestResultDTO toDTO(SoilTestResult e) {
        SoilTestResultDTO dto = new SoilTestResultDTO();
        dto.setId(e.getId());
        dto.setSoilTestId(e.getSoilTest().getId());
        dto.setParameter(e.getParameter());
        dto.setValue(e.getValue());
        dto.setUnit(e.getUnit());
        dto.setSampleCode(e.getSoilTest().getSampleCode());
        return dto;
    }
}
