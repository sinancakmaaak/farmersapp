// src/main/java/com/project/farmersapp/repositories/PhotoRepository.java
package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
}
