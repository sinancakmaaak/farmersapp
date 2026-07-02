package com.project.farmersapp.services;

import com.project.farmersapp.dtos.HarvestDTO;
import com.project.farmersapp.models.Harvest;
import com.project.farmersapp.models.Planting;
import com.project.farmersapp.repositories.HarvestRepository;
import com.project.farmersapp.repositories.PlantingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class HarvestService {

    private final HarvestRepository harvestRepository;
    private final PlantingRepository plantingRepository;

    public Harvest createHarvest(HarvestDTO dto) {
        log.info("Creating new harvest with data: {}", dto);
        
        if (dto.getPlantingId() == null) {
            log.error("Planting ID is null");
            throw new IllegalArgumentException("Planting ID cannot be null");
        }

        if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
            log.error("Invalid quantity: {}", dto.getQuantity());
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        if (dto.getUnit() == null || dto.getUnit().trim().isEmpty()) {
            log.error("Unit is null or empty");
            throw new IllegalArgumentException("Unit cannot be empty");
        }

        if (dto.getDate() == null || dto.getDate().trim().isEmpty()) {
            log.error("Date is null or empty");
            throw new IllegalArgumentException("Date cannot be empty");
        }

        try {
            Planting planting = plantingRepository.findById(dto.getPlantingId())
                    .orElseThrow(() -> {
                        log.error("Planting not found with ID: {}", dto.getPlantingId());
                        return new RuntimeException("Planting not found with ID: " + dto.getPlantingId());
                    });

            log.info("Found planting: {}", planting);

            Harvest harvest = Harvest.builder()
                    .quantity(dto.getQuantity())
                    .unit(dto.getUnit())
                    .date(dto.getDate())
                    .planting(planting)
                    .build();

            log.info("Saving harvest: {}", harvest);
            Harvest savedHarvest = harvestRepository.save(harvest);
            log.info("Successfully created harvest with ID: {}", savedHarvest.getId());
            return savedHarvest;

        } catch (Exception e) {
            log.error("Error while creating harvest: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create harvest: " + e.getMessage());
        }
    }

    public List<HarvestDTO> getAllHarvests() {
        log.info("Fetching all harvests");
        try {
            List<Harvest> harvests = harvestRepository.findAll();
            log.info("Found {} harvests in database", harvests.size());
            
            // Debug için her kaydı logla
            harvests.forEach(harvest -> {
                log.info("Harvest ID: {}, PlantingId: {}, Date: {}, Quantity: {}, Unit: {}",
                    harvest.getId(),
                    harvest.getPlanting() != null ? harvest.getPlanting().getId() : "null",
                    harvest.getDate(),
                    harvest.getQuantity(),
                    harvest.getUnit()
                );
            });

            List<HarvestDTO> dtos = harvests.stream()
                    .map(harvest -> {
                        HarvestDTO dto = new HarvestDTO();
                        dto.setId(harvest.getId()); // ID'yi ekle
                        dto.setQuantity(harvest.getQuantity());
                        dto.setUnit(harvest.getUnit());
                        dto.setDate(harvest.getDate());
                        if (harvest.getPlanting() != null) {
                            dto.setPlantingId(harvest.getPlanting().getId());
                        }
                        return dto;
                    })
                    .collect(Collectors.toList());
            log.info("Converted {} harvests to DTOs", dtos.size());
            return dtos;
        } catch (Exception e) {
            log.error("Error while fetching harvests: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch harvests: " + e.getMessage());
        }
    }

    public Harvest updateHarvest(Long id, HarvestDTO dto) {
        log.info("Updating harvest with ID: {} and data: {}", id, dto);
        
        if (id == null) {
            throw new IllegalArgumentException("Harvest ID cannot be null");
        }

        Harvest existingHarvest = harvestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Harvest not found with ID: " + id));

        Planting planting = plantingRepository.findById(dto.getPlantingId())
                .orElseThrow(() -> new RuntimeException("Planting not found with ID: " + dto.getPlantingId()));

        try {
            existingHarvest.setQuantity(dto.getQuantity());
            existingHarvest.setUnit(dto.getUnit());
            existingHarvest.setDate(dto.getDate());
            existingHarvest.setPlanting(planting);

            Harvest updatedHarvest = harvestRepository.save(existingHarvest);
            log.info("Successfully updated harvest with ID: {}", updatedHarvest.getId());
            return updatedHarvest;
        } catch (Exception e) {
            log.error("Error while updating harvest: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update harvest: " + e.getMessage());
        }
    }

    public boolean existsById(Long id) {
        log.info("Checking if harvest exists with ID: {}", id);
        return harvestRepository.existsById(id);
    }

    @Transactional
    public void deleteHarvest(Long id) {
        log.info("Deleting harvest with ID: {}", id);
        
        if (id == null) {
            log.error("Harvest ID is null");
            throw new IllegalArgumentException("Harvest ID cannot be null");
        }

        try {
            // Debug için mevcut kayıtları kontrol et
            debugPrintAllHarvests();

            // Önce kaydın var olduğunu kontrol et
            boolean exists = harvestRepository.existsById(id);
            log.info("Harvest exists check for ID {}: {}", id, exists);

            if (!exists) {
                log.error("Harvest not found with ID: {}", id);
                throw new RuntimeException("Hasat kaydı bulunamadı: " + id);
            }

            Harvest harvest = harvestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hasat kaydı bulunamadı: " + id));

            // Planting ilişkisini kontrol et ve gerekirse null yap
            if (harvest.getPlanting() != null) {
                log.info("Removing planting reference for harvest ID: {}", id);
                harvest.setPlanting(null);
                harvestRepository.save(harvest); // İlişkiyi kaldır ve kaydet
            }

            // Silme işlemini gerçekleştir
            log.info("Executing delete operation for harvest ID: {}", id);
            harvestRepository.delete(harvest);
            
            // Değişiklikleri hemen veritabanına yansıt
            log.info("Flushing changes to database for harvest ID: {}", id);
            harvestRepository.flush();
            
            // Debug için silme sonrası kayıtları kontrol et
            debugPrintAllHarvests();
            
            log.info("Successfully deleted harvest with ID: {}", id);
        } catch (RuntimeException e) {
            log.error("Error while deleting harvest: {}", e.getMessage());
            throw new RuntimeException("Hasat silinirken hata oluştu: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while deleting harvest: {}", e.getMessage(), e);
            throw new RuntimeException("Beklenmeyen bir hata oluştu: " + e.getMessage());
        }
    }

    private void debugPrintAllHarvests() {
        log.info("=== DEBUG: Current Harvests in Database ===");
        List<Harvest> allHarvests = harvestRepository.findAll();
        allHarvests.forEach(h -> {
            log.info("Harvest[id={}, plantingId={}, date={}, quantity={}, unit={}]",
                h.getId(),
                h.getPlanting() != null ? h.getPlanting().getId() : "null",
                h.getDate(),
                h.getQuantity(),
                h.getUnit()
            );
        });
        log.info("=== END DEBUG ===");
    }
}
