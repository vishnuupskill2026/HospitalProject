package com.homeoclinic.clinic.config;

import com.homeoclinic.clinic.domain.Role;
import com.homeoclinic.clinic.domain.UserAccount;
import com.homeoclinic.clinic.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DoctorBootstrap {
    @Bean
    ApplicationRunner bootstrapDoctor(UserAccountRepository users, PasswordEncoder passwords,
            @Value("${clinic.bootstrap.doctor-enabled}") boolean enabled,
            @Value("${clinic.bootstrap.doctor-email}") String email,
            @Value("${clinic.bootstrap.doctor-password}") String password) {
        return args -> {
            if (!enabled) return;
            if (email.isBlank() || password.length() < 14)
                throw new IllegalStateException("Doctor bootstrap requires an email and a password of at least 14 characters");
            if (users.findByEmailIgnoreCase(email).isEmpty())
                users.save(new UserAccount(email.trim(), passwords.encode(password), Role.DOCTOR, true));
        };
    }
}