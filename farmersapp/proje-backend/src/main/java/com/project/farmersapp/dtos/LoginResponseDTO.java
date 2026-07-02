package com.project.farmersapp.dtos;

import com.project.farmersapp.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private UserDTO user;

    // *** STRATEGY PATTERN *** - Data Transformation Strategy
    // Static factory method strategy for User -> LoginResponseDTO conversion
    // Alternative strategies: MapStruct, Manual mapping, Reflection-based
    public static LoginResponseDTO fromUser(User user, String token) {
        // *** STRATEGY PATTERN *** - DTO Creation Strategy
        // Manual DTO creation strategy
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setFullName(user.getFullName());
        // Password exclusion strategy - security best practice
        return new LoginResponseDTO(token, userDTO);
    }
}
