// src/main/java/com/project/farmersapp/models/Pesticide.java
package com.project.farmersapp.models;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "pesticide")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pesticide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String chemical;

    @Column(name = "application_date", nullable = false)
    private String applicationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planting_id", nullable = false)
    private Planting planting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = true)
    private Field field;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "greenhouse_id", nullable = true)
    private Greenhouse greenhouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
