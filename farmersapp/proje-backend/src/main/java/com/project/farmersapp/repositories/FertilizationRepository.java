// src/main/java/com/project/farmersapp/repositories/FertilizationRepository.java
package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Fertilization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FertilizationRepository extends JpaRepository<Fertilization, Long> {
}
