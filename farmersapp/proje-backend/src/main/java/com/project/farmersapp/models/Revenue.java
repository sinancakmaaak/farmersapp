
package com.project.farmersapp.models;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "revenues")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Revenue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(columnDefinition = "TEXT")
    private String description;
}
