// src/main/java/com/project/farmersapp/dtos/VehicleDTO.java
package com.project.farmersapp.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class VehicleDTO {
    private Long id;

    @NotBlank(message = "Plaka (licensePlate) boş bırakılamaz")
    private String licensePlate;

    @NotBlank(message = "Araç tipi (type) boş bırakılamaz")
    private String type;

    @NotBlank(message = "Üretici (manufacturer) boş bırakılamaz")
    private String manufacturer;

    @NotBlank(message = "Model boş bırakılamaz")
    private String model;

    @NotNull(message = "Yıl (year) gerekli")
    private Integer year;

    @NotNull(message = "Motor gücü (enginePower) gerekli")
    private Integer enginePower;

    @NotBlank(message = "Yakıt türü (fuelType) boş bırakılamaz")
    private String fuelType;

    /** Kilometre (km) isteğe bağlı **/
    private Long km;

    /** Satın alma tarihi ISO-8601 biçiminde (ör: 2025-06-15) **/
    private String purchaseDate;

    private String notes;
}
