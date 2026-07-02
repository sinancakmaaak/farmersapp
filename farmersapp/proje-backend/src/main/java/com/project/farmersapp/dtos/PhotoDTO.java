// src/main/java/com/project/farmersapp/dtos/PhotoDTO.java
package com.project.farmersapp.dtos;

import lombok.Data;

@Data
public class PhotoDTO {
    private Long id;
    private String url;
    private String uploadDate;
    private Long fieldId;
    private Long vehicleId;
    private Long greenhouseId;
    private String notes;
}
