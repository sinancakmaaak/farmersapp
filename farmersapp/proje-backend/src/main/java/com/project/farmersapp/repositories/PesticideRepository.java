// src/main/java/com/project/farmersapp/repositories/PesticideRepository.java
package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Pesticide;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PesticideRepository extends JpaRepository<Pesticide, Long> {
}
