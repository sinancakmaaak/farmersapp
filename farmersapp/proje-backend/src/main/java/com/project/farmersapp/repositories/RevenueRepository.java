// src/main/java/com/project/farmersapp/repositories/RevenueRepository.java
package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Revenue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RevenueRepository extends JpaRepository<Revenue, Long> {
}
