// src/main/java/com/project/farmersapp/models/SoilTest.java
package com.project.farmersapp.models;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "soil_tests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoilTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sample_code", nullable = false)
    private String sampleCode;

    @Column(name = "sample_date", nullable = false)
    private String sampleDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = true)
    private Field field;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "greenhouse_id", nullable = true)
    private Greenhouse greenhouse;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
