package com.project.farmersapp.services;

import com.project.farmersapp.dtos.SupplierCompanyDTO;
import com.project.farmersapp.models.SupplierCompany;
import com.project.farmersapp.repositories.SupplierCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierCompanyService {

    private final SupplierCompanyRepository repository;

    public SupplierCompany create(SupplierCompanyDTO dto) {
        SupplierCompany company = SupplierCompany.builder()
                .companyName(dto.getCompanyName())
                .contactPerson(dto.getContactPerson())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .address(dto.getAddress())
                .build();
        return repository.save(company);
    }

    public List<SupplierCompanyDTO> getAll() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Optional<SupplierCompany> getById(Long id) {
        return repository.findById(id);
    }

    public SupplierCompany update(Long id, SupplierCompanyDTO dto) {
        SupplierCompany company = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tedarikçi şirket bulunamadı"));

        company.setCompanyName(dto.getCompanyName());
        company.setContactPerson(dto.getContactPerson());
        company.setEmail(dto.getEmail());
        company.setPhoneNumber(dto.getPhoneNumber());
        company.setAddress(dto.getAddress());

        return repository.save(company);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    private SupplierCompanyDTO mapToDto(SupplierCompany company) {
        return SupplierCompanyDTO.builder()
                .id(company.getId())
                .companyName(company.getCompanyName())
                .contactPerson(company.getContactPerson())
                .email(company.getEmail())
                .phoneNumber(company.getPhoneNumber())
                .address(company.getAddress())
                .build();
    }
}
