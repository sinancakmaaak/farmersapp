// src/main/java/com/project/farmersapp/models/Invoice.java
package com.project.farmersapp.models;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Fatura başlığı (örn. “Fatura #1234”) **/
    @Column(nullable = false)
    private String title;

    /** Kaydedilen dosyanın yolu/url’si **/
    @Column(nullable = false)
    private String url;

    /** Yükleme tarihi **/
    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate;

    /** Opsiyonel açıklama **/
    @Column(columnDefinition = "TEXT")
    private String description;
}
