package com.codewithmosh.store.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterUserRequest {
    @NotBlank(message = "name is required")
    @Size(min = 2, max = 255)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank
    @Size(min = 6, max = 25, message = "Password must be at least 6 to 25 characters")
    private String password;
}
