// src/main/java/com/project/farmersapp/repositories/InvoiceRepository.java
package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
}
