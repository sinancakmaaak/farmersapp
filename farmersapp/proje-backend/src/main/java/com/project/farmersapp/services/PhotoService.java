package com.project.farmersapp.services;

import com.project.farmersapp.dtos.PhotoDTO;
import com.project.farmersapp.models.*;
import com.project.farmersapp.repositories.PhotoRepository;
import com.project.farmersapp.repositories.FieldRepository;
import com.project.farmersapp.repositories.VehicleRepository;
import com.project.farmersapp.repositories.GreenhouseRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// *** FACADE PATTERN *** - Photo Management with Multi-Entity Relationships
// Complex photo operations with flexible entity associations
// File storage + multiple entity relationships + business rules tek noktada
@Service
@RequiredArgsConstructor
public class PhotoService {

    // *** FACADE PATTERN *** - Multiple repository and service dependencies
    // 4 farklı entity ile relationship + file storage operations
    private final PhotoRepository repo;
    private final FileStorageService storage;     // File operations facade
    private final FieldRepository fieldRepo;     // Field context
    private final VehicleRepository vehicleRepo; // Vehicle context  
    private final GreenhouseRepository greenhouseRepo; // Greenhouse context

    private static final Logger logger = LoggerFactory.getLogger(PhotoService.class);

    public PhotoDTO create(Long fieldId,
                           Long vehicleId,
                           Long greenhouseId,
                           String notes,
                           MultipartFile file) {

        // *** FACADE PATTERN *** - Complex business rule validation
        // Exactly one parent entity rule enforcement
        int count = 0;
        count += fieldId != null ? 1 : 0;
        count += vehicleId != null ? 1 : 0;
        count += greenhouseId != null ? 1 : 0;
        if (count != 1) {
            throw new IllegalArgumentException("Fotoğraf sadece bir parent (field/vehicle/greenhouse) ile ilişkilendirilmeli.");
        }

        // *** FACADE PATTERN *** - File storage delegation
        String path = storage.storePhoto(file);

        // *** FACADE PATTERN *** - Entity creation with Builder pattern
        Photo p = Photo.builder()
            .url(path)
            .uploadDate(LocalDateTime.now())
            .notes(notes)
            .build();

        // *** FACADE PATTERN *** - Dynamic entity relationship setting
        // Complex conditional logic for different parent entities
        if (fieldId != null) {
            Field f = fieldRepo.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Field bulunamadı: " + fieldId));
            p.setField(f);
        }
        if (vehicleId != null) {
            Vehicle v = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle bulunamadı: " + vehicleId));
            p.setVehicle(v);
        }
        if (greenhouseId != null) {
            Greenhouse g = greenhouseRepo.findById(greenhouseId)
                .orElseThrow(() -> new RuntimeException("Greenhouse bulunamadı: " + greenhouseId));
            p.setGreenhouse(g);
        }

        return toDTO(repo.save(p));
    }

    public List<PhotoDTO> listAll() {
        // *** FACADE PATTERN *** - Simple data retrieval interface
        return repo.findAll().stream()
            .map(this::toDTO) // Complex DTO mapping encapsulated
            .collect(Collectors.toList());
    }

    public PhotoDTO getById(Long id) {
        // *** FACADE PATTERN *** - Simple entity access
        return repo.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new RuntimeException("Photo bulunamadı: " + id));
    }

    public PhotoDTO update(Long id,
                           Long fieldId,
                           Long vehicleId,
                           Long greenhouseId,
                           String notes,
                           MultipartFile file) {

        // *** FACADE PATTERN *** - Complex update workflow
        Photo p = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Photo bulunamadı: " + id));

        // Business rule validation (same as create)
        int count = 0;
        count += fieldId != null ? 1 : 0;
        count += vehicleId != null ? 1 : 0;
        count += greenhouseId != null ? 1 : 0;
        if (count != 1) {
            throw new IllegalArgumentException("Fotoğraf sadece bir parent (field/vehicle/greenhouse) ile ilişkilendirilmeli.");
        }

        p.setNotes(notes);

        // *** FACADE PATTERN *** - Optional file replacement workflow
        if (file != null && !file.isEmpty()) {
            String path = storage.storePhoto(file); // File storage delegation
            
            // Old file cleanup (error-tolerant)
            try {
                Files.deleteIfExists(Paths.get(p.getUrl()));
            } catch (IOException e) {
                logger.warn("Eski fotoğraf silinirken hata oluştu: {}", e.getMessage());
            }
            
            p.setUrl(path);
            p.setUploadDate(LocalDateTime.now());
        }

        // *** FACADE PATTERN *** - Relationship cleanup and reassignment
        // Clear all relationships first, then set the active one
        p.setField(null);
        p.setVehicle(null);
        p.setGreenhouse(null);

        // Set new relationship based on provided ID
        if (fieldId != null) p.setField(fieldRepo.findById(fieldId).get());
        else if (vehicleId != null) p.setVehicle(vehicleRepo.findById(vehicleId).get());
        else p.setGreenhouse(greenhouseRepo.findById(greenhouseId).get());

        return toDTO(repo.save(p));
    }

    public void delete(Long id) {
        // *** FACADE PATTERN *** - Complex deletion with file cleanup
        Photo photo = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Silinecek Photo bulunamadı: " + id));
            
        // File cleanup (error-tolerant)
        try {
            Files.deleteIfExists(Paths.get(photo.getUrl()));
        } catch (IOException e) {
            logger.warn("Fotoğraf dosyası silinirken hata oluştu: {}", e.getMessage());
        }
        
        repo.deleteById(id);
    }

    // *** FACADE PATTERN *** - File serving facade
    // Complex file loading with error handling
    public Resource loadPhotoAsResource(Long id) {
        try {
            logger.info("Loading photo with id: {}", id);
            Photo photo = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Fotoğraf bulunamadı: " + id));
            
            logger.debug("Photo found, loading resource from path: {}", photo.getUrl());
            Resource resource = storage.loadFileAsResource(photo.getUrl());
            
            if (!resource.exists()) {
                logger.error("Photo file does not exist at path: {}", photo.getUrl());
                throw new RuntimeException("Fotoğraf dosyası bulunamadı");
            }
            
            return resource;
        } catch (Exception e) {
            logger.error("Error loading photo resource: ", e);
            throw new RuntimeException("Fotoğraf yüklenirken hata oluştu", e);
        }
    }

    // *** FACADE PATTERN *** - Complex DTO mapping with multiple relationships
    private PhotoDTO toDTO(Photo p) {
        PhotoDTO dto = new PhotoDTO();
        dto.setId(p.getId());
        dto.setUrl(p.getUrl());
        dto.setUploadDate(p.getUploadDate().toString());
        // Dynamic relationship mapping based on which entity is associated
        dto.setFieldId(p.getField()      != null ? p.getField().getId()      : null);
        dto.setVehicleId(p.getVehicle()  != null ? p.getVehicle().getId()    : null);
        dto.setGreenhouseId(p.getGreenhouse()!= null? p.getGreenhouse().getId(): null);
        dto.setNotes(p.getNotes());
        return dto;
    }
}
