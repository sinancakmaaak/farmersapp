
package com.project.farmersapp.services;

import com.project.farmersapp.dtos.EmployeeDTO;
import com.project.farmersapp.models.Employee;
import com.project.farmersapp.repositories.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository repo;

    public EmployeeDTO create(EmployeeDTO dto) {
        Employee e = Employee.builder()
            .fullName(dto.getFullName())
            .email(dto.getEmail())
            .phoneNumber(dto.getPhoneNumber())
            .salary(dto.getSalary())
            .position(dto.getPosition())
            .hireDate(dto.getHireDate())
            .build();
        return toDTO(repo.save(e));
    }

    public List<EmployeeDTO> getAll() {
        return repo.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public EmployeeDTO getById(Long id) {
        return repo.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new RuntimeException("Çalışan bulunamadı: " + id));
    }

    public EmployeeDTO update(Long id, EmployeeDTO dto) {
        Employee e = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Çalışan bulunamadı: " + id));
        e.setFullName(dto.getFullName());
        e.setEmail(dto.getEmail());
        e.setPhoneNumber(dto.getPhoneNumber());
        e.setSalary(dto.getSalary());
        e.setPosition(dto.getPosition());
        e.setHireDate(dto.getHireDate());
        return toDTO(repo.save(e));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Silinecek çalışan bulunamadı: " + id);
        }
        repo.deleteById(id);
    }

    private EmployeeDTO toDTO(Employee e) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(e.getId());
        dto.setFullName(e.getFullName());
        dto.setEmail(e.getEmail());
        dto.setPhoneNumber(e.getPhoneNumber());
        dto.setSalary(e.getSalary());
        dto.setPosition(e.getPosition());
        dto.setHireDate(e.getHireDate());
        return dto;
    }
}
