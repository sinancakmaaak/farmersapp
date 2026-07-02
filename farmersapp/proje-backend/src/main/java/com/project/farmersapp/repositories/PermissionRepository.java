package com.project.farmersapp.repositories;

import com.project.farmersapp.models.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, String> {
    Optional<Permission> findByCode(String code);
    Set<Permission> findByModuleOrderByCodeAsc(String module);
    boolean existsByCode(String code);
} 