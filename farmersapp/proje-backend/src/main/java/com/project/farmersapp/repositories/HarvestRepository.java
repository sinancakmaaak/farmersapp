package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Harvest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HarvestRepository extends JpaRepository<Harvest, Long> {
    
    // *** STRATEGY PATTERN *** - Custom Query Strategy
    // JPQL strategy ile custom query implementation
    // Alternative strategies: Native SQL, Criteria API, Specification
    @Query("SELECT h FROM Harvest h LEFT JOIN FETCH h.planting WHERE h.id = :id")
    Harvest findByIdWithPlanting(@Param("id") Long id);
    
    // *** STRATEGY PATTERN *** - JpaRepository Strategy
    // Spring Data JPA built-in strategies:
    // findAll() - Load all strategy
    // findById() - Single entity strategy  
    // save() - Persist strategy
    // delete() - Remove strategy
    // count() - Count strategy
    // existsById() - Existence check strategy
}
