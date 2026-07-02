// src/main/java/com/project/farmersapp/models/Task.java
package com.project.farmersapp.models;

import com.project.farmersapp.enums.TaskPriority;
import com.project.farmersapp.enums.TaskStatus;
import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // *** STRATEGY PATTERN *** - Task Status Strategy
    // Enum strategy for different task states (BEKLEMEDE, DEVAM_EDIYOR, TAMAMLANDI, IPTAL_EDILDI)
    // Her status farklı business logic'e sahip olabilir
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    // *** STRATEGY PATTERN *** - Task Priority Strategy
    // Enum strategy for task prioritization (DUSUK, ORTA, YUKSEK)
    // Her priority level farklı processing strategy'si kullanabilir
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority;

    private LocalDateTime dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User creator;

    // *** STRATEGY PATTERN *** - Task Context Strategy
    // Farklı context'lerde çalışan task'lar (Field, Greenhouse, Planting)
    // Her context farklı validation ve processing logic'i gerektirir
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_field_id")
    private Field field;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_greenhouse_id")
    private Greenhouse greenhouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_planting_id")
    private Planting planting;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // *** STRATEGY PATTERN *** - Lifecycle Strategy
    // JPA lifecycle callbacks - farklı entity lifecycle strategies
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
