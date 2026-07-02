package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Irrigation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IrrigationRepository extends JpaRepository<Irrigation, Long> {
}

