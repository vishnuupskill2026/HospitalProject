package com.homeoclinic.clinic.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "user_accounts", uniqueConstraints = @UniqueConstraint(name = "uk_user_email", columnNames = "email"))
public class UserAccount {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, length = 254)
    private String email;
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16)
    private Role role;
    @Column(nullable = false)
    private boolean enabled = true;
    @Column(name = "is_admin", nullable = false)
    private boolean admin;

    protected UserAccount() {}
    public UserAccount(String email, String passwordHash, Role role) {
        this.email = email; this.passwordHash = passwordHash; this.role = role; this.enabled = true;
    }
    public UserAccount(String email, String passwordHash, Role role, boolean admin) {
        this(email, passwordHash, role); this.admin = admin;
    }
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public boolean isEnabled() { return enabled; }
    public boolean isAdmin() { return admin; }
}