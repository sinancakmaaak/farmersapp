
package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
}
