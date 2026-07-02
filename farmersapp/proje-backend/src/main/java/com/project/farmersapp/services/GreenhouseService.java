package com.project.farmersapp.services;

import com.project.farmersapp.dtos.GreenhouseDTO;
import com.project.farmersapp.models.Greenhouse;
import com.project.farmersapp.repositories.GreenhouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GreenhouseService {

    private final GreenhouseRepository greenhouseRepository;

    public Greenhouse createGreenhouse(GreenhouseDTO dto) {
        Greenhouse greenhouse = Greenhouse.builder()
                .name(dto.getName())
                .area(dto.getArea())
                .notes(dto.getNotes())
                .build();

        return greenhouseRepository.save(greenhouse);
    }

    public List<Greenhouse> getAllGreenhouses() {
        return greenhouseRepository.findAll();
    }

    public Optional<Greenhouse> getGreenhouseById(Long id) {
        return greenhouseRepository.findById(id);
    }

    public Greenhouse updateGreenhouse(Long id, GreenhouseDTO dto) {
        Greenhouse greenhouse = greenhouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sera bulunamadı"));

        greenhouse.setName(dto.getName());
        greenhouse.setArea(dto.getArea());
        greenhouse.setNotes(dto.getNotes());

        return greenhouseRepository.save(greenhouse);
    }

    public void deleteGreenhouse(Long id) {
        greenhouseRepository.deleteById(id);
    }
}
