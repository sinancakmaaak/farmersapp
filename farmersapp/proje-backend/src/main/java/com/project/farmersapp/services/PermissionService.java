package com.project.farmersapp.services;

import com.project.farmersapp.models.Permission;
import com.project.farmersapp.repositories.PermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    public Permission createPermission(Permission permission) {
        if (permissionRepository.existsByCode(permission.getCode())) {
            throw new IllegalArgumentException("Permission code already exists: " + permission.getCode());
        }
        return permissionRepository.save(permission);
    }

    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    public Optional<Permission> getPermissionById(String id) {
        return permissionRepository.findById(id);
    }

    public Optional<Permission> getPermissionByCode(String code) {
        return permissionRepository.findByCode(code);
    }

    public Set<Permission> getPermissionsByModule(String module) {
        return permissionRepository.findByModuleOrderByCodeAsc(module);
    }

    public void deletePermission(String id) {
        permissionRepository.deleteById(id);
    }

    public boolean hasPermission(Set<Permission> userPermissions, String requiredPermissionCode) {
        return userPermissions.stream()
                .anyMatch(permission -> permission.getCode().equals(requiredPermissionCode));
    }
} 