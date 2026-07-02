package com.project.farmersapp.services;

import com.project.farmersapp.dtos.PesticideDTO;
import com.project.farmersapp.models.Pesticide;
import com.project.farmersapp.models.Planting;
import com.project.farmersapp.repositories.PesticideRepository;
import com.project.farmersapp.repositories.PlantingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PesticideService {

    private final PesticideRepository repo;
    private final PlantingRepository plantingRepo;

    public PesticideDTO create(PesticideDTO dto) {
        Planting p = plantingRepo.findById(dto.getPlantingId())
            .orElseThrow(() -> new RuntimeException("Planting bulunamadı: " + dto.getPlantingId()));

        Pesticide ent = Pesticide.builder()
            .chemical(dto.getChemical())
            .applicationDate(dto.getApplicationDate())
            .planting(p)
            .field(p.getField())
            .greenhouse(p.getGreenhouse())
            .product(p.getProduct())
            .notes(dto.getNotes())
            .build();

        return toDTO(repo.save(ent));
    }

    public PesticideDTO update(Long id, PesticideDTO dto) {
        Pesticide ex = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("İlaçlama kaydı bulunamadı: " + id));

        Planting p = plantingRepo.findById(dto.getPlantingId())
            .orElseThrow(() -> new RuntimeException("Planting bulunamadı: " + dto.getPlantingId()));

        ex.setChemical(dto.getChemical());
        ex.setApplicationDate(dto.getApplicationDate());
        ex.setPlanting(p);
        ex.setField(p.getField());
        ex.setGreenhouse(p.getGreenhouse());
        ex.setProduct(p.getProduct());
        ex.setNotes(dto.getNotes());

        return toDTO(repo.save(ex));
    }

    public List<PesticideDTO> getAll() {
        return repo.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public PesticideDTO getById(Long id) {
        return repo.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new RuntimeException("İlaçlama kaydı bulunamadı: " + id));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Silinecek kayıt bulunamadı: " + id);
        }
        repo.deleteById(id);
    }

    private PesticideDTO toDTO(Pesticide e) {
        PesticideDTO dto = new PesticideDTO();
        dto.setId(e.getId());
        dto.setChemical(e.getChemical());
        dto.setApplicationDate(e.getApplicationDate());
        dto.setPlantingId(e.getPlanting().getId());
        dto.setProductId(e.getProduct().getId());
        dto.setFieldId(e.getField() != null ? e.getField().getId() : null);
        dto.setGreenhouseId(e.getGreenhouse() != null ? e.getGreenhouse().getId() : null);
        dto.setNotes(e.getNotes());
        return dto;
    }
}
