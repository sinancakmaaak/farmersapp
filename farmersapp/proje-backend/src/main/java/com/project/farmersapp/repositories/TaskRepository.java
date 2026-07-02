// src/main/java/com/project/farmersapp/repositories/TaskRepository.java
package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
