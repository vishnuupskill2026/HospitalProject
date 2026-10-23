package com.homeoclinic.clinic.api;

import com.homeoclinic.clinic.service.DoctorAccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/doctors")
@PreAuthorize("hasRole('ADMIN')")
public class DoctorAccountController {
    private final DoctorAccountService doctors;
    public DoctorAccountController(DoctorAccountService doctors) { this.doctors = doctors; }

    public record CreateDoctorRequest(@Email @NotBlank String email, @NotBlank @Size(min = 14, max = 128) String initialPassword) {}
    public record DoctorView(UUID id, String email, boolean enabled, boolean admin) {}

    @GetMapping
    List<DoctorView> list() {
        return doctors.listDoctors().stream().map(account -> new DoctorView(account.id(), account.email(), account.enabled(), account.admin())).toList();
    }

    @PostMapping
    DoctorView create(@Valid @RequestBody CreateDoctorRequest request) {
        var doctor = doctors.createDoctor(request.email(), request.initialPassword());
        return new DoctorView(doctor.id(), doctor.email(), doctor.enabled(), doctor.admin());
    }
}