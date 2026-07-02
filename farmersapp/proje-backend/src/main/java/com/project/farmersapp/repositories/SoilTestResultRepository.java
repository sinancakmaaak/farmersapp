package com.project.farmersapp.repositories;

import com.project.farmersapp.models.SoilTestResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SoilTestResultRepository extends JpaRepository<SoilTestResult, Long> {
}