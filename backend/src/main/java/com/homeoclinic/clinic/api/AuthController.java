package com.homeoclinic.clinic.api;

import com.homeoclinic.clinic.repository.UserAccountRepository;
import com.homeoclinic.clinic.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final UserAccountRepository users;
    private final PasswordEncoder passwords;
    private final JwtService tokens;
    public AuthController(UserAccountRepository users, PasswordEncoder passwords, JwtService tokens) {
        this.users = users; this.passwords = passwords; this.tokens = tokens;
    }
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record LoginResponse(String accessToken, String tokenType, long expiresInSeconds, String role, String email, boolean admin) {}
    @PostMapping("/login")
    LoginResponse login(@Valid @RequestBody LoginRequest request) {
        var user = users.findByEmailIgnoreCase(request.email())
                .filter(account -> account.isEnabled() && passwords.matches(request.password(), account.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        return new LoginResponse(tokens.issue(user), "Bearer", tokens.expiresInSeconds(), user.getRole().name(), user.getEmail(), user.isAdmin());
    }
}