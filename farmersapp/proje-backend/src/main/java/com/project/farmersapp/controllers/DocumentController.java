// src/main/java/com/project/farmersapp/controllers/DocumentController.java
package com.project.farmersapp.controllers;

import com.project.farmersapp.dtos.DocumentDTO;
import com.project.farmersapp.services.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.io.InputStream;
import org.springframework.core.io.InputStreamResource;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class DocumentController {

    private final DocumentService svc;
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/tiff",
        "image/webp"
    );
    
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", 
        ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"
    );

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(
            @RequestParam("title") String title,
            @RequestParam(value="description", required=false) String description,
            @RequestParam("file") MultipartFile file) {

        // Validate file type
        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();
        
        if (originalFilename == null || contentType == null) {
            return ResponseEntity.badRequest().body("Geçersiz dosya");
        }

        // Check file extension
        boolean validExtension = ALLOWED_EXTENSIONS.stream()
            .anyMatch(ext -> originalFilename.toLowerCase().endsWith(ext));
            
        // Check content type
        boolean validContentType = ALLOWED_CONTENT_TYPES.contains(contentType);

        if (!validExtension || !validContentType) {
            return ResponseEntity.badRequest()
                .body("Desteklenmeyen dosya türü. Desteklenen formatlar: PDF, Word (DOC/DOCX), Excel (XLS/XLSX), Resim (JPG/PNG/GIF/BMP/TIFF/WEBP)");
        }

        DocumentDTO created = svc.store(title, description, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<DocumentDTO>> listAll() {
        return ResponseEntity.ok(svc.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(svc.getById(id));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        try {
            Resource resource = svc.loadFileAsResource(id);
            String downloadFilename = resource.getFilename();
            
            if (downloadFilename == null) {
                return ResponseEntity.badRequest().build();
            }

            // Set content type based on file extension
            String contentType;
            String lowerFilename = downloadFilename.toLowerCase();
            
            // Encode the filename to handle special characters
            String encodedFilename = URLEncoder.encode(downloadFilename, StandardCharsets.UTF_8.toString())
                .replace("+", "%20");

            if (lowerFilename.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (lowerFilename.endsWith(".docx")) {
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            } else if (lowerFilename.endsWith(".doc")) {
                contentType = "application/msword";
            } else if (lowerFilename.endsWith(".xls")) {
                contentType = "application/vnd.ms-excel";
            } else if (lowerFilename.endsWith(".xlsx")) {
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (lowerFilename.endsWith(".png")) {
                contentType = "image/png";
            } else if (lowerFilename.endsWith(".gif")) {
                contentType = "image/gif";
            } else if (lowerFilename.endsWith(".bmp")) {
                contentType = "image/bmp";
            } else if (lowerFilename.endsWith(".tiff")) {
                contentType = "image/tiff";
            } else if (lowerFilename.endsWith(".webp")) {
                contentType = "image/webp";
            } else {
                contentType = "application/octet-stream";
            }

            // Set headers for download
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_TYPE, contentType);
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFilename);
            
            // Prevent caching
            headers.add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
            headers.add(HttpHeaders.PRAGMA, "no-cache");
            headers.add(HttpHeaders.EXPIRES, "0");

            // Add CORS headers
            headers.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION);
            
            InputStreamResource inputStreamResource = new InputStreamResource(resource.getInputStream());
            return ResponseEntity.ok()
                .headers(headers)
                .contentLength(resource.contentLength())
                .body(inputStreamResource);
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
        }
    }

    @PutMapping(path="/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value="description", required=false) String description,
            @RequestParam(value="file", required=false) MultipartFile file) {

        if (file != null && !file.isEmpty()) {
            // Validate file type for update
            String originalFilename = file.getOriginalFilename();
            String contentType = file.getContentType();
            
            if (originalFilename == null || contentType == null) {
                return ResponseEntity.badRequest().body("Geçersiz dosya");
            }

            // Check file extension
            boolean validExtension = ALLOWED_EXTENSIONS.stream()
                .anyMatch(ext -> originalFilename.toLowerCase().endsWith(ext));
                
            // Check content type
            boolean validContentType = ALLOWED_CONTENT_TYPES.contains(contentType);

            if (!validExtension || !validContentType) {
                return ResponseEntity.badRequest()
                    .body("Desteklenmeyen dosya türü. Desteklenen formatlar: PDF, Word (DOC/DOCX), Excel (XLS/XLSX), Resim (JPG/PNG/GIF/BMP/TIFF/WEBP)");
            }
        }

        DocumentDTO updated = svc.update(id, title, description, file);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        svc.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<DocumentDTO>> searchDocuments(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(svc.searchDocuments(query));
    }
}
