package com.project.farmersapp.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "field")
public class Field {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Area is required")
    @Positive(message = "Area must be positive")
    @Column(nullable = false)
    private Double area;

    @NotBlank(message = "Soil type is required")
    private String soilType;

    private String notes;

    @OneToMany(mappedBy = "field", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("field")
    @Builder.Default
    @ToString.Exclude
    private List<Planting> plantings = new ArrayList<>();

    @Override
    public String toString() {
        return "Field(id=" + id + 
               ", name=" + name + 
               ", area=" + area + 
               ", location=" + location + ")";
    }
}
