package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.InvoiceDTO;
import com.project.farmersapp.services.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class InvoiceController {

    private final InvoiceService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InvoiceDTO> upload(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file) {

        // Validate file type
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        
        if (!isAllowedFileType(contentType, originalFilename)) {
            return ResponseEntity.badRequest().build();
        }

        InvoiceDTO created = service.create(title, description, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<InvoiceDTO>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Resource resource = service.downloadInvoice(id);
        
        // Determine content type from file
        String contentType = determineContentType(resource);
        
        // Get original filename from resource
        String filename = resource.getFilename();
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InvoiceDTO> update(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        // Validate file type if new file is provided
        if (file != null && !file.isEmpty()) {
            String contentType = file.getContentType();
            String originalFilename = file.getOriginalFilename();
            
            if (!isAllowedFileType(contentType, originalFilename)) {
                return ResponseEntity.badRequest().build();
            }
        }

        InvoiceDTO updated = service.update(id, title, description, file);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isAllowedFileType(String contentType, String filename) {
        if (filename == null) return false;
        
        String lowerFilename = filename.toLowerCase();
        
        // Check by file extension
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

    private String determineContentType(Resource resource) {
        try {
            String filename = resource.getFilename();
            if (filename == null) {
                return MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            // Try to determine content type from file
            Path path = Paths.get(resource.getURI());
            String contentType = Files.probeContentType(path);
            
            if (contentType != null) {
                return contentType;
            }

            // Fallback to extension-based detection
            String lowerFilename = filename.toLowerCase();
            
            if (lowerFilename.endsWith(".pdf")) {
                return "application/pdf";
            } else if (lowerFilename.endsWith(".doc")) {
                return "application/msword";
            } else if (lowerFilename.endsWith(".docx")) {
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            } else if (lowerFilename.endsWith(".xls")) {
                return "application/vnd.ms-excel";
            } else if (lowerFilename.endsWith(".xlsx")) {
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
                return "image/jpeg";
            } else if (lowerFilename.endsWith(".png")) {
                return "image/png";
            } else if (lowerFilename.endsWith(".gif")) {
                return "image/gif";
            } else if (lowerFilename.endsWith(".bmp")) {
                return "image/bmp";
            } else if (lowerFilename.endsWith(".tiff")) {
                return "image/tiff";
            } else if (lowerFilename.endsWith(".webp")) {
                return "image/webp";
            }
            
            return MediaType.APPLICATION_OCTET_STREAM_VALUE;
            
        } catch (Exception e) {
            return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
    }
}
