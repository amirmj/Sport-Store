package com.codewithmosh.store.controllers;

import com.codewithmosh.store.dtos.JwtResponse;
import com.codewithmosh.store.dtos.UserLoginDto;
import com.codewithmosh.store.services.JwtService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class LoginController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> checkCredentials(
            @RequestBody UserLoginDto loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        var token = jwtService.generateToken(loginRequest.getEmail());
        return ResponseEntity.ok(new JwtResponse(token));
    }


    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Void> handleBadRequestCredentials() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
