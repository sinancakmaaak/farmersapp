package com.project.farmersapp.services;

import com.project.farmersapp.dtos.UserDTO;
import com.project.farmersapp.models.User;
import com.project.farmersapp.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    public User createUser(UserDTO dto) {
        User user = new User();
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setPassword(dto.getPassword());
        user.setFullName(dto.getFullName());
        return userRepository.save(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> {
                    UserDTO dto = new UserDTO();
                    dto.setFullName(user.getFullName());
                    dto.setPhoneNumber(user.getPhoneNumber());
                    dto.setPassword(null);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    UserDTO dto = new UserDTO();
                    dto.setFullName(user.getFullName());
                    dto.setPhoneNumber(user.getPhoneNumber());
                    dto.setPassword(user.getPassword());
                    return dto;
                })
                .orElseThrow(() -> new RuntimeException("User bulunamadı: " + id));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public User getUserByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public UserDetails loadUserByUsername(String phoneNumber) throws UsernameNotFoundException {
        User user = getUserByPhoneNumber(phoneNumber);
        return new org.springframework.security.core.userdetails.User(
            user.getPhoneNumber(),
            user.getPassword(),
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }
}
