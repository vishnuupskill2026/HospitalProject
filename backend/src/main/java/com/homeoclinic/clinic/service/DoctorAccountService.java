package com.homeoclinic.clinic.service;

import com.homeoclinic.clinic.domain.Role;
import com.homeoclinic.clinic.domain.UserAccount;
import com.homeoclinic.clinic.repository.UserAccountRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class DoctorAccountService {
    public record DoctorAccount(UUID id, String email, boolean enabled, boolean admin) {
        static DoctorAccount from(UserAccount account) { return new DoctorAccount(account.getId(), account.getEmail(), account.isEnabled(), account.isAdmin()); }
    }

    private final UserAccountRepository users;
    private final PasswordEncoder passwords;
    public DoctorAccountService(UserAccountRepository users, PasswordEncoder passwords) {
        this.users = users; this.passwords = passwords;
    }

    @Transactional(readOnly = true)
    public List<DoctorAccount> listDoctors() {
        return users.findAllByRoleOrderByEmailAsc(Role.DOCTOR).stream().map(DoctorAccount::from).toList();
    }

    public DoctorAccount createDoctor(String email, String rawPassword) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(normalizedEmail))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        if (rawPassword == null || rawPassword.length() < 14)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Initial password must be at least 14 characters");
        try {
            return DoctorAccount.from(users.saveAndFlush(new UserAccount(normalizedEmail, passwords.encode(rawPassword), Role.DOCTOR, false)));
        } catch (DataIntegrityViolationException duplicate) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists", duplicate);
        }
    }
}