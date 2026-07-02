package com.project.farmersapp.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "planting")
public class Planting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ToString.Exclude
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "plantings"})
    @ToString.Exclude
    private Field field;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "greenhouse_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "plantings", "irrigations"})
    @ToString.Exclude
    private Greenhouse greenhouse;

    @OneToMany(mappedBy = "planting", orphanRemoval = false)
    @JsonIgnoreProperties("planting")
    @Builder.Default
    @ToString.Exclude
    private List<Harvest> harvests = new ArrayList<>();

    @Column(nullable = false)
    private Long quantity;

    @Column(nullable = false)
    private Double plantedArea;

    @Column(nullable = false)
    private LocalDate plantingDate;

    private String notes;

    @Override
    public String toString() {
        return "Planting(id=" + id + 
               ", quantity=" + quantity + 
               ", plantedArea=" + plantedArea + 
               ", plantingDate=" + plantingDate + 
               ", notes=" + notes + ")";
    }
}
