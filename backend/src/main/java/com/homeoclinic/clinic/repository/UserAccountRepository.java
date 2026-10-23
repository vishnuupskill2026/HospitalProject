package com.homeoclinic.clinic.repository;

import com.homeoclinic.clinic.domain.UserAccount;
import com.homeoclinic.clinic.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<UserAccount> findAllByRoleOrderByEmailAsc(Role role);
}