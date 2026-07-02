package com.project.farmersapp.services;

import com.project.farmersapp.dtos.TaskDTO;
import com.project.farmersapp.models.*;
import com.project.farmersapp.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

// *** FACADE PATTERN *** - Task Management Facade
// Complex task operations with multiple entities için unified interface
// 5 farklı repository'yi tek service'den yönetme
@Service
@RequiredArgsConstructor
public class TaskService {

    // *** FACADE PATTERN *** - Multiple repository dependencies
    // Task entity'nin 5 farklı entity ile relationship'ini yönetme
    private final TaskRepository repo;
    private final UserRepository userRepo;           // Creator & Assignee management
    private final FieldRepository fieldRepo;         // Field context
    private final GreenhouseRepository greenhouseRepo; // Greenhouse context
    private final PlantingRepository plantingRepo;   // Planting context

    public TaskDTO create(TaskDTO dto) {
        // *** FACADE PATTERN *** - Complex entity relationship validation
        // Multiple repository calls ve business rules tek method'da
        
        // 1. Creator validation
        User creator = userRepo.findById(dto.getCreatedById())
            .orElseThrow(() -> new RuntimeException("Oluşturan kullanıcı bulunamadı: " + dto.getCreatedById()));

        // 2. Optional assignee validation
        User assignee = null;
        if (dto.getAssignedToId() != null) {
            assignee = userRepo.findById(dto.getAssignedToId())
                .orElseThrow(() -> new RuntimeException("Atanan kullanıcı bulunamadı: " + dto.getAssignedToId()));
        }

        // 3. Optional field context validation
        Field field = null;
        if (dto.getRelatedFieldId() != null) {
            field = fieldRepo.findById(dto.getRelatedFieldId())
                .orElseThrow(() -> new RuntimeException("Tarla bulunamadı: " + dto.getRelatedFieldId()));
        }

        // 4. Optional greenhouse context validation
        Greenhouse greenhouse = null;
        if (dto.getRelatedGreenhouseId() != null) {
            greenhouse = greenhouseRepo.findById(dto.getRelatedGreenhouseId())
                .orElseThrow(() -> new RuntimeException("Sera bulunamadı: " + dto.getRelatedGreenhouseId()));
        }

        // 5. Optional planting context validation
        Planting planting = null;
        if (dto.getRelatedPlantingId() != null) {
            planting = plantingRepo.findById(dto.getRelatedPlantingId())
                .orElseThrow(() -> new RuntimeException("Ekim bulunamadı: " + dto.getRelatedPlantingId()));
        }

        // 6. Date parsing with error handling
        LocalDateTime due = null;
        if (dto.getDueDate() != null) {
            try {
                due = LocalDateTime.parse(dto.getDueDate());
            } catch (DateTimeParseException ex) {
                throw new IllegalArgumentException("Geçersiz tarih formatı: " + dto.getDueDate());
            }
        }

        // 7. Complex entity creation with Builder pattern
        Task t = Task.builder()
            .title(dto.getTitle())
            .description(dto.getDescription())
            .status(dto.getStatus())
            .priority(dto.getPriority())
            .dueDate(due)
            .creator(creator)
            .assignee(assignee)
            .field(field)
            .greenhouse(greenhouse)
            .planting(planting)
            .build();

        return toDTO(repo.save(t));
    }

    public List<TaskDTO> getAll() {
        // *** FACADE PATTERN *** - Simple data retrieval interface
        // Complex entity relationships hidden from client
        return repo.findAll().stream()
            .map(this::toDTO) // Complex DTO transformation encapsulated
            .collect(Collectors.toList());
    }

    public TaskDTO getById(Long id) {
        // *** FACADE PATTERN *** - Simple entity access
        return repo.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new RuntimeException("Görev bulunamadı: " + id));
    }

    public TaskDTO update(Long id, TaskDTO dto) {
        // *** FACADE PATTERN *** - Complex update workflow with business rules
        Task t = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Görev bulunamadı: " + id));

        // Field updates
        if (dto.getTitle() != null) t.setTitle(dto.getTitle());
        t.setDescription(dto.getDescription());
        t.setStatus(dto.getStatus());
        t.setPriority(dto.getPriority());

        // Date handling with validation
        if (dto.getDueDate() != null) {
            try {
                t.setDueDate(LocalDateTime.parse(dto.getDueDate()));
            } catch (DateTimeParseException ex) {
                throw new IllegalArgumentException("Geçersiz tarih formatı: " + dto.getDueDate());
            }
        } else {
            t.setDueDate(null);
        }

        // Optional assignee update
        if (dto.getAssignedToId() != null) {
            User a = userRepo.findById(dto.getAssignedToId())
                .orElseThrow(() -> new RuntimeException("Atanan kullanıcı bulunamadı: " + dto.getAssignedToId()));
            t.setAssignee(a);
        } else {
            t.setAssignee(null);
        }

        // *** FACADE PATTERN *** - Complex context switching logic
        // Business rule: Only one context can be active at a time
        if (dto.getRelatedFieldId() != null) {
            Field f = fieldRepo.findById(dto.getRelatedFieldId())
                .orElseThrow(() -> new RuntimeException("Tarla bulunamadı: " + dto.getRelatedFieldId()));
            t.setField(f);
            t.setGreenhouse(null); // Clear other contexts
            t.setPlanting(null);
        }
        if (dto.getRelatedGreenhouseId() != null) {
            Greenhouse g = greenhouseRepo.findById(dto.getRelatedGreenhouseId())
                .orElseThrow(() -> new RuntimeException("Sera bulunamadı: " + dto.getRelatedGreenhouseId()));
            t.setGreenhouse(g);
            t.setField(null); // Clear other contexts
            t.setPlanting(null);
        }
        if (dto.getRelatedPlantingId() != null) {
            Planting p = plantingRepo.findById(dto.getRelatedPlantingId())
                .orElseThrow(() -> new RuntimeException("Ekim bulunamadı: " + dto.getRelatedPlantingId()));
            t.setPlanting(p);
            t.setField(null); // Clear other contexts
            t.setGreenhouse(null);
        }

        return toDTO(repo.save(t));
    }

    public void delete(Long id) {
        // *** FACADE PATTERN *** - Simple deletion with validation
        if (!repo.existsById(id)) {
            throw new RuntimeException("Silinecek görev bulunamadı: " + id);
        }
        repo.deleteById(id);
    }

    // *** FACADE PATTERN *** - Complex DTO mapping encapsulated
    // Client doesn't see entity->DTO transformation complexity
    private TaskDTO toDTO(Task t) {
        TaskDTO dto = new TaskDTO();
        dto.setId(t.getId());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setStatus(t.getStatus());
        dto.setPriority(t.getPriority());
        dto.setDueDate(t.getDueDate() != null ? t.getDueDate().toString() : null);
        dto.setCreatedById(t.getCreator().getId());
        dto.setAssignedToId(t.getAssignee() != null ? t.getAssignee().getId() : null);
        dto.setRelatedFieldId(t.getField() != null ? t.getField().getId() : null);
        dto.setRelatedGreenhouseId(t.getGreenhouse() != null ? t.getGreenhouse().getId() : null);
        dto.setRelatedPlantingId(t.getPlanting() != null ? t.getPlanting().getId() : null);
        return dto;
    }
}
