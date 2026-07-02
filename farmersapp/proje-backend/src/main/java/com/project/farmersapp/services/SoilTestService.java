// src/main/java/com/project/farmersapp/services/SoilTestService.java
package com.project.farmersapp.services;

import com.project.farmersapp.dtos.SoilTestDTO;
import com.project.farmersapp.models.SoilTest;
import com.project.farmersapp.models.Field;
import com.project.farmersapp.models.Greenhouse;
import com.project.farmersapp.repositories.SoilTestRepository;
import com.project.farmersapp.repositories.FieldRepository;
import com.project.farmersapp.repositories.GreenhouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SoilTestService {

    private final SoilTestRepository repo;
    private final FieldRepository fieldRepo;
    private final GreenhouseRepository greenhouseRepo;

    public SoilTestDTO create(SoilTestDTO dto) {
        Field field = null;
        if (dto.getFieldId() != null) {
            field = fieldRepo.findById(dto.getFieldId())
                .orElseThrow(() -> new RuntimeException("Tarla bulunamadı: " + dto.getFieldId()));
        }
        Greenhouse gh = null;
        if (dto.getGreenhouseId() != null) {
            gh = greenhouseRepo.findById(dto.getGreenhouseId())
                .orElseThrow(() -> new RuntimeException("Sera bulunamadı: " + dto.getGreenhouseId()));
        }

        SoilTest e = SoilTest.builder()
            .sampleCode(dto.getSampleCode())
            .sampleDate(dto.getSampleDate())
            .field(field)
            .greenhouse(gh)
            .notes(dto.getNotes())
            .build();

        return toDTO(repo.save(e));
    }

    public List<SoilTestDTO> getAll() {
        return repo.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public SoilTestDTO getById(Long id) {
        return repo.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new RuntimeException("Toprak testi bulunamadı: " + id));
    }

    public SoilTestDTO update(Long id, SoilTestDTO dto) {
        SoilTest e = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Toprak testi bulunamadı: " + id));

        if (dto.getFieldId() != null) {
            Field field = fieldRepo.findById(dto.getFieldId())
                .orElseThrow(() -> new RuntimeException("Tarla bulunamadı: " + dto.getFieldId()));
            e.setField(field);
            e.setGreenhouse(null);
        }
        if (dto.getGreenhouseId() != null) {
            Greenhouse gh = greenhouseRepo.findById(dto.getGreenhouseId())
                .orElseThrow(() -> new RuntimeException("Sera bulunamadı: " + dto.getGreenhouseId()));
            e.setGreenhouse(gh);
            e.setField(null);
        }

        e.setSampleCode(dto.getSampleCode());
        e.setSampleDate(dto.getSampleDate());
        e.setNotes(dto.getNotes());

        return toDTO(repo.save(e));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Silinecek toprak testi bulunamadı: " + id);
        }
        repo.deleteById(id);
    }

    private SoilTestDTO toDTO(SoilTest e) {
        SoilTestDTO dto = new SoilTestDTO();
        dto.setId(e.getId());
        dto.setSampleCode(e.getSampleCode());
        dto.setSampleDate(e.getSampleDate());
        dto.setFieldId(e.getField() != null ? e.getField().getId() : null);
        dto.setGreenhouseId(e.getGreenhouse() != null ? e.getGreenhouse().getId() : null);
        dto.setNotes(e.getNotes());
        return dto;
    }
}
