
package com.project.farmersapp.models;

import lombok.*;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "soil_test_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoilTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soil_test_id", nullable = false)
    private SoilTest soilTest;

    @Column(nullable = false)
    private String parameter;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column(nullable = false)
    private String unit;
}
