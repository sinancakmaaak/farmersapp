package com.project.farmersapp.repositories;

import com.project.farmersapp.models.SupplierCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierCompanyRepository extends JpaRepository<SupplierCompany, Long> {
}
