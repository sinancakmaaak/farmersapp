package com.project.farmersapp.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String code; // Örnek: CREATE_TASK, VIEW_FINANCIAL

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String module; // Örnek: TASKS, FINANCE, INVENTORY
} 