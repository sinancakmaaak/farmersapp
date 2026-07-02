// src/main/java/com/project/farmersapp/models/Fertilization.java
package com.project.farmersapp.models;

import lombok.*;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "fertilization")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fertilization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fertilization_date", nullable = false)
    private String date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planting_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Planting planting;
}
