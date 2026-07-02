package com.project.farmersapp.services;

import com.project.farmersapp.models.Permission;
import com.project.farmersapp.models.Role;
import com.project.farmersapp.repositories.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionService permissionService;

    public RoleService(RoleRepository roleRepository, PermissionService permissionService) {
        this.roleRepository = roleRepository;
        this.permissionService = permissionService;
    }

    public Role createRole(Role role) {
        if (roleRepository.existsByName(role.getName())) {
            throw new IllegalArgumentException("Role name already exists: " + role.getName());
        }
        return roleRepository.save(role);
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Optional<Role> getRoleById(String id) {
        return roleRepository.findById(id);
    }

    public Optional<Role> getRoleByName(String name) {
        return roleRepository.findByName(name);
    }

    public Role updateRole(String id, Role roleDetails) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + id));

        role.setName(roleDetails.getName());
        role.setDescription(roleDetails.getDescription());
        role.setPermissions(roleDetails.getPermissions());
        role.setActive(roleDetails.isActive());
        role.setDisplayOrder(roleDetails.getDisplayOrder());

        return roleRepository.save(role);
    }

    public void deleteRole(String id) {
        roleRepository.deleteById(id);
    }

    public Role addPermissionToRole(String roleId, String permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));
        
        Permission permission = permissionService.getPermissionById(permissionId)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found"));

        role.getPermissions().add(permission);
        return roleRepository.save(role);
    }

    public Role removePermissionFromRole(String roleId, String permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));
        
        role.getPermissions().removeIf(p -> p.getId().equals(permissionId));
        return roleRepository.save(role);
    }

    public boolean hasPermission(Set<Role> userRoles, String permissionCode) {
        return userRoles.stream()
                .filter(Role::isActive)
                .flatMap(role -> role.getPermissions().stream())
                .anyMatch(permission -> permission.getCode().equals(permissionCode));
    }
}
