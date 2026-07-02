// src/main/java/com/project/farmersapp/dtos/InvoiceDTO.java
package com.project.farmersapp.dtos;

import lombok.Data;

@Data
public class InvoiceDTO {
    private Long id;
    private String title;
    private String url;
    private String uploadDate;
    private String description;
}
