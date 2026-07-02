// src/main/java/com/project/farmersapp/controllers/PhotoController.java
package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.PhotoDTO;
import com.project.farmersapp.services.PhotoService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PhotoController {

    private final PhotoService svc;
    private static final Logger logger = LoggerFactory.getLogger(PhotoController.class);

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoDTO> upload(
            @RequestParam(value="fieldId",      required=false) Long fieldId,
            @RequestParam(value="vehicleId",    required=false) Long vehicleId,
            @RequestParam(value="greenhouseId", required=false) Long greenhouseId,
            @RequestParam(value="notes",        required=false) String notes,
            @RequestParam("file") MultipartFile file) {

        PhotoDTO created = svc.create(fieldId, vehicleId, greenhouseId, notes, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<PhotoDTO>> listAll() {
        return ResponseEntity.ok(svc.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhotoDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(svc.getById(id));
    }

    @PutMapping(path="/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoDTO> update(
            @PathVariable Long id,
            @RequestParam(value="fieldId",      required=false) Long fieldId,
            @RequestParam(value="vehicleId",    required=false) Long vehicleId,
            @RequestParam(value="greenhouseId", required=false) Long greenhouseId,
            @RequestParam(value="notes",        required=false) String notes,
            @RequestParam(value="file",         required=false) MultipartFile file) {

        PhotoDTO updated = svc.update(id, fieldId, vehicleId, greenhouseId, notes, file);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        svc.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<Resource> viewPhoto(@PathVariable Long id) {
        try {
            logger.debug("Fotoğraf görüntüleme isteği alındı. ID: {}", id);
            Resource resource = svc.loadPhotoAsResource(id);
            
            // Determine content type
            String contentType = null;
            Path path = Paths.get(resource.getFile().getAbsolutePath());
            try {
                contentType = Files.probeContentType(path);
                logger.debug("Tespit edilen content type: {}", contentType);
            } catch (Exception e) {
                logger.warn("Content type belirlenemedi, varsayılan kullanılıyor", e);
                contentType = "image/jpeg";
            }

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000")
                .body(resource);
        } catch (Exception e) {
            logger.error("Fotoğraf görüntüleme hatası:", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadPhoto(@PathVariable Long id) {
        try {
            logger.debug("Fotoğraf indirme isteği alındı. ID: {}", id);
            Resource resource = svc.loadPhotoAsResource(id);
            
            // Determine content type
            String contentType = null;
            Path path = Paths.get(resource.getFile().getAbsolutePath());
            try {
                contentType = Files.probeContentType(path);
                logger.debug("Tespit edilen content type: {}", contentType);
            } catch (Exception e) {
                logger.warn("Content type belirlenemedi, varsayılan kullanılıyor", e);
                contentType = "image/jpeg";
            }
            
            String headerValue = "attachment; filename=\"photo_" + id + getFileExtension(contentType) + "\"";
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                .body(resource);
        } catch (Exception e) {
            logger.error("Fotoğraf indirme hatası:", e);
            return ResponseEntity.notFound().build();
        }
    }

    private String getFileExtension(String contentType) {
        switch (contentType) {
            case "image/jpeg":
                return ".jpg";
            case "image/png":
                return ".png";
            default:
                return ".jpg";
        }
    }
}
