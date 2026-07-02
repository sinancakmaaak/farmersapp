package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Planting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlantingRepository extends JpaRepository<Planting, Long> {
}
