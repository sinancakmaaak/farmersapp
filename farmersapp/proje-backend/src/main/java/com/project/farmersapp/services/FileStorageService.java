// src/main/java/com/project/farmersapp/services/FileStorageService.java
package com.project.farmersapp.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root;
    private final Path photosDir;
    private final Path invoicesDir;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.photosDir = this.root.resolve("photos");
        this.invoicesDir = this.root.resolve("invoices");
        try {
            Files.createDirectories(root);
            Files.createDirectories(photosDir);
            Files.createDirectories(invoicesDir);
        } catch(IOException e) {
            throw new RuntimeException("Upload klasörleri oluşturulamadı", e);
        }
    }

    public String storePhoto(MultipartFile file) {
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = getFileExtension(originalFilename);
            String newFilename = UUID.randomUUID().toString() + fileExtension;
            
            Path targetLocation = photosDir.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            return targetLocation.toString();
        } catch (IOException e) {
            throw new RuntimeException("Fotoğraf kaydedilemedi", e);
        }
    }

    public String storeInvoice(MultipartFile file) {
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = getFileExtension(originalFilename);
            String newFilename = UUID.randomUUID().toString() + fileExtension;
            
            Path targetLocation = invoicesDir.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            return targetLocation.toString();
        } catch (IOException e) {
            throw new RuntimeException("Fatura kaydedilemedi", e);
        }
    }

    public String storeFile(MultipartFile file) {
        try {
            String filename = StringUtils.cleanPath(file.getOriginalFilename());
            Path targetLocation = root.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return targetLocation.toString();
        } catch (IOException e) {
            throw new RuntimeException("Dosya kaydedilemedi", e);
        }
    }

    public Resource loadFileAsResource(String filePath) {
        try {
            Path file = Paths.get(filePath);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Dosya okunamıyor: " + filePath);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Dosya bulunamadı: " + filePath, e);
        }
    }

    public void deleteFile(String filePath) {
        try {
            Path file = Paths.get(filePath);
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new RuntimeException("Dosya silinemedi: " + filePath, e);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return ".bin"; // neutral extension for unknown files
        }
        return filename.substring(filename.lastIndexOf(".")).toLowerCase();
    }
}
