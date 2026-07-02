package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Field;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FieldRepository extends JpaRepository<Field, Long> {
    // ❗ BURADAKİ Long çok önemli
}
