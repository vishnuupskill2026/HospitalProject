package com.homeoclinic.clinic.api;

import com.homeoclinic.clinic.domain.Patient;
import com.homeoclinic.clinic.service.PatientService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.security.Principal;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {
    private final PatientService patients;
    public PatientController(PatientService patients) { this.patients = patients; }
    public record PatientRequest(@NotBlank String firstName, @NotBlank String lastName, LocalDate dateOfBirth,
            String gender, String phone, String email, String address, String emergencyContactName,
            String emergencyContactPhone, String medicalHistory, String chiefComplaints, String complaintDuration,
            String physicalGenerals, String appetite, String thirst, String cravings, String aversions,
            String thermalReaction, String perspiration, String sleep, String dreams, String mentalGenerals,
            String disposition, String fears, String anxiety, String emotionalState, String modalities,
            String aggravations, String ameliorations, String pastHistory, String familyHistory) {}
    public record PatientView(UUID id, String firstName, String lastName, LocalDate dateOfBirth, String gender,
            String phone, String email, String address, String emergencyContactName, String emergencyContactPhone,
            String medicalHistory, String chiefComplaints, String complaintDuration, String physicalGenerals,
            String appetite, String thirst, String cravings, String aversions, String thermalReaction, String perspiration,
            String sleep, String dreams, String mentalGenerals, String disposition, String fears, String anxiety,
            String emotionalState, String modalities, String aggravations, String ameliorations, String pastHistory, String familyHistory) {
        static PatientView from(Patient p) { return new PatientView(p.getId(), p.getFirstName(), p.getLastName(), p.getDateOfBirth(), p.getGender(), p.getPhone(), p.getEmail(), p.getAddress(), p.getEmergencyContactName(), p.getEmergencyContactPhone(), p.getMedicalHistory(), p.getChiefComplaints(), p.getComplaintDuration(), p.getPhysicalGenerals(), p.getAppetite(), p.getThirst(), p.getCravings(), p.getAversions(), p.getThermalReaction(), p.getPerspiration(), p.getSleep(), p.getDreams(), p.getMentalGenerals(), p.getDisposition(), p.getFears(), p.getAnxiety(), p.getEmotionalState(), p.getModalities(), p.getAggravations(), p.getAmeliorations(), p.getPastHistory(), p.getFamilyHistory()); }
    }
    @GetMapping @PreAuthorize("hasAnyRole('DOCTOR','STAFF')")
    List<PatientView> list(@RequestParam(defaultValue = "") String q) { return patients.search(q).stream().map(PatientView::from).toList(); }
    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('DOCTOR','STAFF')")
    PatientView get(@PathVariable UUID id) { return PatientView.from(patients.get(id)); }
    @GetMapping("/me") @PreAuthorize("hasRole('PATIENT')")
    PatientView self(Principal principal) { return PatientView.from(patients.getByEmail(principal.getName())); }
    @PostMapping @PreAuthorize("hasAnyRole('DOCTOR','STAFF')")
    PatientView create(@Valid @RequestBody PatientRequest request) { return PatientView.from(patients.create(toEntity(request))); }
    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('DOCTOR','STAFF')")
    PatientView update(@PathVariable UUID id, @Valid @RequestBody PatientRequest request) {
        return PatientView.from(patients.update(id, toEntity(request)));
    }
    private Patient toEntity(PatientRequest r) {
        return new Patient(r.firstName(), r.lastName(), r.dateOfBirth(), r.gender(), r.phone(), r.email(), r.address(),
            r.emergencyContactName(), r.emergencyContactPhone(), r.medicalHistory(), r.chiefComplaints(), r.complaintDuration(),
            r.physicalGenerals(), r.appetite(), r.thirst(), r.cravings(), r.aversions(), r.thermalReaction(), r.perspiration(),
            r.sleep(), r.dreams(), r.mentalGenerals(), r.disposition(), r.fears(), r.anxiety(), r.emotionalState(),
            r.modalities(), r.aggravations(), r.ameliorations(), r.pastHistory(), r.familyHistory());
    }
}