package com.project.farmersapp.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "irrigation")
public class Irrigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "irrigations"})
    private Field field;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "greenhouse_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "irrigations", "plantings"})
    private Greenhouse greenhouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Product product;

    @Column(nullable = false)
    private LocalDate date;

    private String notes;
}
