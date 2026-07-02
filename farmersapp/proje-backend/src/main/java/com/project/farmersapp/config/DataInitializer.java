package com.project.farmersapp.config;

import com.project.farmersapp.models.Permission;
import com.project.farmersapp.models.Role;
import com.project.farmersapp.services.PermissionService;
import com.project.farmersapp.services.RoleService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CommandLineRunner initData(PermissionService permissionService, RoleService roleService) {
        return args -> {
            // Temel izinleri oluştur
            List<Permission> permissions = Arrays.asList(
                // Tarla/Sera İzinleri
                createPermission("VIEW_FIELDS", "Tarlaları görüntüleme", "FIELDS"),
                createPermission("MANAGE_FIELDS", "Tarla yönetimi", "FIELDS"),
                createPermission("VIEW_GREENHOUSES", "Seraları görüntüleme", "GREENHOUSES"),
                createPermission("MANAGE_GREENHOUSES", "Sera yönetimi", "GREENHOUSES"),

                // Ürün İzinleri
                createPermission("VIEW_PRODUCTS", "Ürünleri görüntüleme", "PRODUCTS"),
                createPermission("MANAGE_PRODUCTS", "Ürün yönetimi", "PRODUCTS"),
                createPermission("VIEW_PLANTINGS", "Ekimleri görüntüleme", "PLANTINGS"),
                createPermission("MANAGE_PLANTINGS", "Ekim yönetimi", "PLANTINGS"),

                // Tarımsal İşlem İzinleri
                createPermission("VIEW_FERTILIZATIONS", "Gübrelemeleri görüntüleme", "FERTILIZATIONS"),
                createPermission("MANAGE_FERTILIZATIONS", "Gübreleme yönetimi", "FERTILIZATIONS"),
                createPermission("VIEW_PESTICIDES", "İlaçlamaları görüntüleme", "PESTICIDES"),
                createPermission("MANAGE_PESTICIDES", "İlaçlama yönetimi", "PESTICIDES"),
                createPermission("VIEW_IRRIGATION", "Sulamaları görüntüleme", "IRRIGATION"),
                createPermission("MANAGE_IRRIGATION", "Sulama yönetimi", "IRRIGATION"),
                createPermission("VIEW_HARVESTS", "Hasatları görüntüleme", "HARVESTS"),
                createPermission("MANAGE_HARVESTS", "Hasat yönetimi", "HARVESTS"),

                // Envanter İzinleri
                createPermission("VIEW_INVENTORY", "Envanteri görüntüleme", "INVENTORY"),
                createPermission("MANAGE_INVENTORY", "Envanter yönetimi", "INVENTORY"),
                createPermission("VIEW_SUPPLIERS", "Tedarikçileri görüntüleme", "SUPPLIERS"),
                createPermission("MANAGE_SUPPLIERS", "Tedarikçi yönetimi", "SUPPLIERS"),

                // Finansal İzinler
                createPermission("VIEW_FINANCIAL", "Finansal bilgileri görüntüleme", "FINANCIAL"),
                createPermission("MANAGE_FINANCIAL", "Finansal yönetim", "FINANCIAL"),
                createPermission("VIEW_INVOICES", "Faturaları görüntüleme", "INVOICES"),
                createPermission("MANAGE_INVOICES", "Fatura yönetimi", "INVOICES"),

                // İnsan Kaynakları İzinleri
                createPermission("VIEW_EMPLOYEES", "Çalışanları görüntüleme", "EMPLOYEES"),
                createPermission("MANAGE_EMPLOYEES", "Çalışan yönetimi", "EMPLOYEES"),
                createPermission("VIEW_TASKS", "Görevleri görüntüleme", "TASKS"),
                createPermission("MANAGE_TASKS", "Görev yönetimi", "TASKS"),

                // Diğer İzinler
                createPermission("VIEW_WEATHER", "Hava durumunu görüntüleme", "WEATHER"),
                createPermission("VIEW_EXCHANGE", "Döviz kurlarını görüntüleme", "EXCHANGE"),
                createPermission("VIEW_DOCUMENTS", "Dokümanları görüntüleme", "DOCUMENTS"),
                createPermission("MANAGE_DOCUMENTS", "Doküman yönetimi", "DOCUMENTS"),
                createPermission("VIEW_PHOTOS", "Fotoğrafları görüntüleme", "PHOTOS"),
                createPermission("MANAGE_PHOTOS", "Fotoğraf yönetimi", "PHOTOS"),

                // Sistem İzinleri
                createPermission("MANAGE_USERS", "Kullanıcı yönetimi", "SYSTEM"),
                createPermission("MANAGE_ROLES", "Rol yönetimi", "SYSTEM"),
                createPermission("VIEW_LOGS", "Sistem loglarını görüntüleme", "SYSTEM")
            );

            // İzinleri kaydet
            Set<Permission> savedPermissions = new HashSet<>();
            for (Permission permission : permissions) {
                try {
                    savedPermissions.add(permissionService.createPermission(permission));
                } catch (IllegalArgumentException e) {
                    // İzin zaten varsa, mevcut izni al
                    permissionService.getPermissionByCode(permission.getCode())
                            .ifPresent(savedPermissions::add);
                }
            }

            // Rolleri oluştur
            createAdminRole(roleService, savedPermissions);
            createManagerRole(roleService, savedPermissions);
            createAgronomistRole(roleService, savedPermissions);
            createWorkerRole(roleService, savedPermissions);
            createAccountantRole(roleService, savedPermissions);
        };
    }

    private Permission createPermission(String code, String description, String module) {
        // *** BUILDER PATTERN KULLANIMI *** - Permission objesi oluşturma
        // Fluent API ile okunabilir kod yazımı sağlar
        return Permission.builder()
                .code(code)
                .description(description)
                .module(module)
                .build(); // Builder pattern ile obje oluşturma tamamlanıyor
    }

    private void createAdminRole(RoleService roleService, Set<Permission> permissions) {
        // *** BUILDER PATTERN KULLANIMI *** - Role objesi oluşturma
        // Multiple field'lı complex objeleri step-by-step inşa etme
        Role adminRole = Role.builder()
                .name("ADMIN")
                .description("Sistem yöneticisi")
                .permissions(permissions)
                .isActive(true)
                .displayOrder(1)
                .build(); // Builder chain ile obje inşası tamamlanıyor
        try {
            roleService.createRole(adminRole);
        } catch (IllegalArgumentException e) {
            // Rol zaten varsa güncelle
            roleService.getRoleByName("ADMIN").ifPresent(existing -> {
                existing.setPermissions(permissions);
                roleService.updateRole(existing.getId(), existing);
            });
        }
    }

    private void createManagerRole(RoleService roleService, Set<Permission> allPermissions) {
        Set<Permission> managerPermissions = new HashSet<>(allPermissions);
        managerPermissions.removeIf(p -> p.getModule().equals("SYSTEM"));

        Role managerRole = Role.builder()
                .name("MANAGER")
                .description("Çiftlik yöneticisi")
                .permissions(managerPermissions)
                .isActive(true)
                .displayOrder(2)
                .build();
        try {
            roleService.createRole(managerRole);
        } catch (IllegalArgumentException e) {
            roleService.getRoleByName("MANAGER").ifPresent(existing -> {
                existing.setPermissions(managerPermissions);
                roleService.updateRole(existing.getId(), existing);
            });
        }
    }

    private void createAgronomistRole(RoleService roleService, Set<Permission> allPermissions) {
        Set<Permission> agronomistPermissions = new HashSet<>();
        allPermissions.forEach(p -> {
            if (p.getCode().startsWith("VIEW_") || 
                p.getModule().equals("FIELDS") ||
                p.getModule().equals("GREENHOUSES") ||
                p.getModule().equals("PRODUCTS") ||
                p.getModule().equals("PLANTINGS") ||
                p.getModule().equals("FERTILIZATIONS") ||
                p.getModule().equals("PESTICIDES") ||
                p.getModule().equals("IRRIGATION") ||
                p.getModule().equals("HARVESTS") ||
                p.getModule().equals("TASKS")) {
                agronomistPermissions.add(p);
            }
        });

        Role agronomistRole = Role.builder()
                .name("AGRONOMIST")
                .description("Ziraat mühendisi")
                .permissions(agronomistPermissions)
                .isActive(true)
                .displayOrder(3)
                .build();
        try {
            roleService.createRole(agronomistRole);
        } catch (IllegalArgumentException e) {
            roleService.getRoleByName("AGRONOMIST").ifPresent(existing -> {
                existing.setPermissions(agronomistPermissions);
                roleService.updateRole(existing.getId(), existing);
            });
        }
    }

    private void createWorkerRole(RoleService roleService, Set<Permission> allPermissions) {
        Set<Permission> workerPermissions = new HashSet<>();
        allPermissions.forEach(p -> {
            if (p.getCode().startsWith("VIEW_") && !p.getModule().equals("SYSTEM") && 
                !p.getModule().equals("FINANCIAL") && !p.getModule().equals("EMPLOYEES")) {
                workerPermissions.add(p);
            }
        });

        Role workerRole = Role.builder()
                .name("WORKER")
                .description("Çiftlik işçisi")
                .permissions(workerPermissions)
                .isActive(true)
                .displayOrder(4)
                .build();
        try {
            roleService.createRole(workerRole);
        } catch (IllegalArgumentException e) {
            roleService.getRoleByName("WORKER").ifPresent(existing -> {
                existing.setPermissions(workerPermissions);
                roleService.updateRole(existing.getId(), existing);
            });
        }
    }

    private void createAccountantRole(RoleService roleService, Set<Permission> allPermissions) {
        Set<Permission> accountantPermissions = new HashSet<>();
        allPermissions.forEach(p -> {
            if (p.getCode().startsWith("VIEW_") || 
                p.getModule().equals("FINANCIAL") ||
                p.getModule().equals("INVOICES") ||
                p.getModule().equals("INVENTORY") ||
                p.getModule().equals("SUPPLIERS")) {
                accountantPermissions.add(p);
            }
        });

        Role accountantRole = Role.builder()
                .name("ACCOUNTANT")
                .description("Muhasebeci")
                .permissions(accountantPermissions)
                .isActive(true)
                .displayOrder(5)
                .build();
        try {
            roleService.createRole(accountantRole);
        } catch (IllegalArgumentException e) {
            roleService.getRoleByName("ACCOUNTANT").ifPresent(existing -> {
                existing.setPermissions(accountantPermissions);
                roleService.updateRole(existing.getId(), existing);
            });
        }
    }
} 