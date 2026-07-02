// src/main/java/com/project/farmersapp/services/InvoiceService.java
package com.project.farmersapp.services;

import com.project.farmersapp.dtos.InvoiceDTO;
import com.project.farmersapp.models.Invoice;
import com.project.farmersapp.repositories.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// *** FACADE PATTERN *** - Invoice Management with File Storage Facade
// Complex file upload, storage, ve database operations için unified interface
// File management + data persistence + error handling tek noktada
@Service
@RequiredArgsConstructor
public class InvoiceService {

    // *** FACADE PATTERN *** - Multiple service dependencies
    // Client sadece InvoiceService'i kullanır, file storage complexity gizlenir
    private final InvoiceRepository repo;
    private final FileStorageService storage; // File operations facade

    public InvoiceDTO create(String title,
                           String description,
                           MultipartFile file) {
        // *** FACADE PATTERN *** - Complex file upload workflow
        // File validation + storage + database persistence tek method'da
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fatura dosyası gereklidir");
        }
        
        // Validate file type
        if (!isValidFileType(file)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Desteklenmeyen dosya türü. Desteklenen formatlar: PDF, Word (DOC/DOCX), Excel (XLS/XLSX), Resim (JPG/PNG/GIF/BMP/TIFF/WEBP)");
        }
        
        try {
            // 1. File storage operation (delegates to FileStorageService facade)
            String path = storage.storeInvoice(file);
            
            // 2. Entity creation with Builder pattern
            Invoice inv = Invoice.builder()
                .title(title)
                .description(description)
                .url(path)
                .uploadDate(LocalDateTime.now())
                .build();
                
            // 3. Database persistence + DTO conversion
            return toDTO(repo.save(inv));
        } catch (Exception e) {
            // 4. Error handling and user-friendly messages
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "Fatura kaydedilirken bir hata oluştu: " + e.getMessage()
            );
        }
    }

    private boolean isValidFileType(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) return false;
        
        String lowerFilename = filename.toLowerCase();
        
        return lowerFilename.endsWith(".pdf") ||
               lowerFilename.endsWith(".doc") ||
               lowerFilename.endsWith(".docx") ||
               lowerFilename.endsWith(".xls") ||
               lowerFilename.endsWith(".xlsx") ||
               lowerFilename.endsWith(".jpg") ||
               lowerFilename.endsWith(".jpeg") ||
               lowerFilename.endsWith(".png") ||
               lowerFilename.endsWith(".gif") ||
               lowerFilename.endsWith(".bmp") ||
               lowerFilename.endsWith(".tiff") ||
               lowerFilename.endsWith(".webp");
    }

    public List<InvoiceDTO> listAll() {
        // *** FACADE PATTERN *** - Simple data retrieval interface
        // Database access + DTO transformation + error handling
        try {
            return repo.findAll().stream()
                .map(this::toDTO) // Complex DTO mapping encapsulated
                .collect(Collectors.toList());
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "Faturalar listelenirken bir hata oluştu: " + e.getMessage()
            );
        }
    }

    public InvoiceDTO getById(Long id) {
        // *** FACADE PATTERN *** - Simple entity access with error handling
        Invoice inv = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Fatura bulunamadı: " + id
            ));
        return toDTO(inv);
    }

    public Resource downloadInvoice(Long id) {
        // *** FACADE PATTERN *** - Complex file download workflow
        try {
            Invoice inv = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "İndirilecek fatura bulunamadı: " + id
                ));
            
            return storage.loadFileAsResource(inv.getUrl());
        } catch (Exception e) {
            if (e instanceof ResponseStatusException) {
                throw e;
            }
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Fatura indirilirken bir hata oluştu: " + e.getMessage()
            );
        }
    }

    public InvoiceDTO update(Long id,
                           String title,
                           String description,
                           MultipartFile file) {
        // *** FACADE PATTERN *** - Complex update workflow with file management
        Invoice inv = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Fatura bulunamadı: " + id
            ));

        try {
            // 1. Basic field updates
            inv.setTitle(title);
            inv.setDescription(description);

            // 2. Optional file replacement workflow
            if (file != null && !file.isEmpty()) {
                // Validate file type
                if (!isValidFileType(file)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Desteklenmeyen dosya türü. Desteklenen formatlar: PDF, Word (DOC/DOCX), Excel (XLS/XLSX), Resim (JPG/PNG/GIF/BMP/TIFF/WEBP)");
                }
                
                // Delete old file (error-tolerant)
                try {
                    storage.deleteFile(inv.getUrl());
                } catch (Exception e) {
                    // Log the error but continue with the update
                    System.err.println("Eski dosya silinirken hata: " + e.getMessage());
                }
                
                // Store new file
                String path = storage.storeInvoice(file);
                inv.setUrl(path);
                inv.setUploadDate(LocalDateTime.now());
            }

            // 3. Database persistence
            return toDTO(repo.save(inv));
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Fatura güncellenirken bir hata oluştu: " + e.getMessage()
            );
        }
    }

    public void delete(Long id) {
        // *** FACADE PATTERN *** - Complex deletion workflow
        // Database deletion + file cleanup + error handling
        try {
            Invoice inv = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Silinecek fatura bulunamadı: " + id
                ));
            
            // 1. File cleanup (error-tolerant)
            try {
                storage.deleteFile(inv.getUrl());
            } catch (Exception e) {
                // Log the error but continue with the deletion
                System.err.println("Dosya silinirken hata: " + e.getMessage());
            }
            
            // 2. Database deletion
            repo.deleteById(id);
        } catch (Exception e) {
            if (e instanceof ResponseStatusException) {
                throw e;
            }
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Fatura silinirken bir hata oluştu: " + e.getMessage()
            );
        }
    }

    // *** FACADE PATTERN *** - DTO transformation encapsulated
    private InvoiceDTO toDTO(Invoice inv) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setId(inv.getId());
        dto.setTitle(inv.getTitle());
        dto.setUrl(inv.getUrl());
        dto.setUploadDate(inv.getUploadDate().toString());
        dto.setDescription(inv.getDescription());
        return dto;
    }
}
