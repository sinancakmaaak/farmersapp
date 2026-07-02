package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Greenhouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GreenhouseRepository extends JpaRepository<Greenhouse, Long> {
}
