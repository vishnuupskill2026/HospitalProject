package com.homeoclinic.clinic.service;

import com.homeoclinic.clinic.domain.Patient;
import com.homeoclinic.clinic.repository.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Service
@Transactional
public class PatientService {
    private final PatientRepository patients;
    public PatientService(PatientRepository patients) { this.patients = patients; }
    @Transactional(readOnly = true)
    public List<Patient> search(String query) { return patients.searchActive(query == null ? "" : query.trim()); }
    @Transactional(readOnly = true)
    public Patient get(UUID id) { return patients.findById(id).filter(Patient::isActive).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)); }
    @Transactional(readOnly = true)
    public Patient getByEmail(String email) { return patients.findByEmailIgnoreCaseAndActiveTrue(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)); }
    public Patient create(Patient patient) { return patients.save(patient); }
    public Patient update(UUID id, Patient changes) {
        Patient target = get(id); target.update(changes); return patients.save(target);
    }
}