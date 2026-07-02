package com.project.farmersapp.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class DocumentDTO {
    private Long id;

    @NotBlank
    private String title;

    private String url;
    private String uploadDate;   // ISO string
    private String originalFilename;
    private String description;
}
