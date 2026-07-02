package com.project.farmersapp.services;

import com.project.farmersapp.dtos.CategoryDTO;
import com.project.farmersapp.models.Category;
import com.project.farmersapp.repositories.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public Category createCategory(CategoryDTO dto) {
        Category category = Category.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();

        return categoryRepository.save(category);
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> {
                    CategoryDTO dto = new CategoryDTO();
                    dto.setName(c.getName());
                    dto.setDescription(c.getDescription());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public Category updateCategory(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kategori bulunamadı"));

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
