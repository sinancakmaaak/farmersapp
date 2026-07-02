package com.project.farmersapp.models;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String url;         // Dosyanın disk veya bulut üzerindeki yolu

    private String originalFilename;  // Orijinal dosya adı

    private LocalDateTime uploadDate;

    @Column(columnDefinition="TEXT")
    private String description;
}
