
package com.project.farmersapp.services;

import com.project.farmersapp.dtos.VehicleDTO;
import com.project.farmersapp.models.Vehicle;
import com.project.farmersapp.repositories.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository repo;

    public VehicleDTO create(VehicleDTO dto) {
        Vehicle v = Vehicle.builder()
            .licensePlate(dto.getLicensePlate())
            .type(dto.getType())
            .manufacturer(dto.getManufacturer())
            .model(dto.getModel())
            .year(dto.getYear())
            .enginePower(dto.getEnginePower())
            .fuelType(dto.getFuelType())
            .km(dto.getKm())
            .purchaseDate(parseDate(dto.getPurchaseDate()))
            .notes(dto.getNotes())
            .build();
        return toDTO(repo.save(v));
    }

    public List<VehicleDTO> getAll() {
        return repo.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public VehicleDTO getById(Long id) {
        return repo.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new RuntimeException("Araç bulunamadı: " + id));
    }

    public VehicleDTO update(Long id, VehicleDTO dto) {
        Vehicle v = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Araç bulunamadı: " + id));

        v.setLicensePlate(dto.getLicensePlate());
        v.setType(dto.getType());
        v.setManufacturer(dto.getManufacturer());
        v.setModel(dto.getModel());
        v.setYear(dto.getYear());
        v.setEnginePower(dto.getEnginePower());
        v.setFuelType(dto.getFuelType());
        v.setKm(dto.getKm());
        v.setPurchaseDate(parseDate(dto.getPurchaseDate()));
        v.setNotes(dto.getNotes());

        return toDTO(repo.save(v));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Silinecek araç bulunamadı: " + id);
        }
        repo.deleteById(id);
    }

    private VehicleDTO toDTO(Vehicle v) {
        VehicleDTO dto = new VehicleDTO();
        dto.setId(v.getId());
        dto.setLicensePlate(v.getLicensePlate());
        dto.setType(v.getType());
        dto.setManufacturer(v.getManufacturer());
        dto.setModel(v.getModel());
        dto.setYear(v.getYear());
        dto.setEnginePower(v.getEnginePower());
        dto.setFuelType(v.getFuelType());
        dto.setKm(v.getKm());
        dto.setPurchaseDate(v.getPurchaseDate() != null ? v.getPurchaseDate().toString() : null);
        dto.setNotes(v.getNotes());
        return dto;
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDate.parse(s);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Geçersiz tarih formatı: " + s);
        }
    }
}
