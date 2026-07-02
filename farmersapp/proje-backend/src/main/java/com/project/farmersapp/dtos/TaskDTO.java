// src/main/java/com/project/farmersapp/dtos/TaskDTO.java
package com.project.farmersapp.dtos;

import com.project.farmersapp.enums.TaskPriority;
import com.project.farmersapp.enums.TaskStatus;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class TaskDTO {

    private Long id;

    @NotBlank(message = "Başlık boş olamaz")
    private String title;

    private String description;

    @NotNull(message = "Durum (status) gerekli")
    private TaskStatus status;

    @NotNull(message = "Öncelik (priority) gerekli")
    private TaskPriority priority;

    private String dueDate;         // ISO-8601 string

    private Long assignedToId;
    @NotNull(message = "Oluşturan kullanıcı gerekli")
    private Long createdById;

    private Long relatedFieldId;
    private Long relatedGreenhouseId;
    private Long relatedPlantingId;
}
