package com.portal.controller;

import com.portal.dto.RegisterRequest;
import com.portal.dto.UserDto;
import com.portal.entity.User;
import com.portal.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for user management and recipient selection.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Phase 1 compatible registration endpoint.
     */
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.registerUser(request);
        return new ResponseEntity<>(UserDto.fromEntity(user), HttpStatus.CREATED);
    }

    /**
     * Retrieves all registered users.
     */
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * Retrieves potential recipients for file transfer (excludes current user).
     */
    @GetMapping("/recipients")
    public ResponseEntity<List<UserDto>> getRecipients(Authentication authentication) {
        String currentUsername = authentication != null ? authentication.getName() : "";
        return ResponseEntity.ok(userService.getPotentialRecipients(currentUsername));
    }

    /**
     * Retrieves a specific user by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserDto.fromEntity(user));
    }

    /**
     * Retrieves current authenticated user profile.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(UserDto.fromEntity(user));
    }
}
