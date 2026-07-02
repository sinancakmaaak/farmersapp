// src/main/java/com/project/farmersapp/services/DocumentService.java
package com.project.farmersapp.services;

import com.project.farmersapp.dtos.DocumentDTO;
import com.project.farmersapp.models.Document;
import com.project.farmersapp.repositories.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository repo;
    private final FileStorageService storage;

    public DocumentDTO store(String title, String description, MultipartFile file) {
        String path = storage.storeFile(file);
        Document d = Document.builder()
            .title(title)
            .description(description)
            .url(path)
            .uploadDate(LocalDateTime.now())
            .build();
        return toDTO(repo.save(d));
    }

    public List<DocumentDTO> listAll() {
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DocumentDTO getById(Long id) {
        Document d = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Document bulunamadı: " + id));
        return toDTO(d);
    }

    public Resource loadFileAsResource(Long id) {
        Document document = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Document bulunamadı: " + id));
        return storage.loadFileAsResource(document.getUrl());
    }

    public DocumentDTO update(Long id, String title, String description, MultipartFile file) {
        Document d = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Document bulunamadı: " + id));

        d.setTitle(title);
        d.setDescription(description);

        if (file != null && !file.isEmpty()) {
            String path = storage.storeFile(file);
            d.setUrl(path);
            d.setUploadDate(LocalDateTime.now());
        }

        return toDTO(repo.save(d));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Silinecek document bulunamadı: " + id);
        }
        repo.deleteById(id);
    }

    private DocumentDTO toDTO(Document d) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(d.getId());
        dto.setTitle(d.getTitle());
        dto.setUrl(d.getUrl());
        dto.setUploadDate(d.getUploadDate().toString());
        dto.setDescription(d.getDescription());
        return dto;
    }

    public List<DocumentDTO> searchDocuments(String query) {
        if (query == null || query.trim().isEmpty()) {
            return listAll();
        }
        
        String searchQuery = query.toLowerCase();
        return repo.findAll().stream()
            .filter(doc -> 
                (doc.getTitle() != null && doc.getTitle().toLowerCase().contains(searchQuery)) ||
                (doc.getDescription() != null && doc.getDescription().toLowerCase().contains(searchQuery))
            )
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
}
