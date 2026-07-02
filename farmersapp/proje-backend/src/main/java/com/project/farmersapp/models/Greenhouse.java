package com.project.farmersapp.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Greenhouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Area is required")
    private Double area;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "greenhouse", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("greenhouse")
    private List<Planting> plantings;

    @OneToMany(mappedBy = "greenhouse", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("greenhouse")
    private List<Irrigation> irrigations;
}

