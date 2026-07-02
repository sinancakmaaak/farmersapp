// src/main/java/com/project/farmersapp/repositories/ExpenseRepository.java
package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
}
