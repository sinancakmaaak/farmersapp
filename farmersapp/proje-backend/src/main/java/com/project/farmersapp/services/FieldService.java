package com.project.farmersapp.services;

import com.project.farmersapp.models.Field;
import com.project.farmersapp.repositories.FieldRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FieldService {
    private final FieldRepository fieldRepository;

    public List<Field> getAllFields() {
        return fieldRepository.findAll();
    }

    public Field getFieldById(Long id) {
        return fieldRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Field not found with id: " + id));
    }

    public Field createField(Field field) {
        if (field.getId() != null) {
            throw new IllegalArgumentException("A new field cannot already have an ID");
        }
        return fieldRepository.save(field);
    }

    public Field updateField(Long id, Field field) {
        Field existingField = getFieldById(id);
        
        existingField.setName(field.getName());
        existingField.setLocation(field.getLocation());
        existingField.setArea(field.getArea());
        existingField.setSoilType(field.getSoilType());
        existingField.setNotes(field.getNotes());
        
        return fieldRepository.save(existingField);
    }

    public void deleteField(Long id) {
        if (!fieldRepository.existsById(id)) {
            throw new EntityNotFoundException("Field not found with id: " + id);
        }
        fieldRepository.deleteById(id);
    }
}
