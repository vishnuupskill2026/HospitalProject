package com.homeoclinic.clinic.api;

import com.homeoclinic.clinic.domain.Prescription;
import com.homeoclinic.clinic.service.PrescriptionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@PreAuthorize("hasRole('DOCTOR')")
public class PrescriptionController {
    private final PrescriptionService prescriptions;
    public PrescriptionController(PrescriptionService prescriptions) { this.prescriptions = prescriptions; }
    public record ItemRequest(@NotNull UUID remedyId, @NotBlank String dosage, @NotBlank String repetition, String duration) {}
    public record PrescriptionRequest(String dietaryRestrictions, @NotNull List<@Valid ItemRequest> items) {}
    public record ItemView(UUID remedyId, String remedyName, String potency, String dosage, String repetition, String duration) {}
    public record PrescriptionView(UUID id, UUID consultationId, OffsetDateTime prescribedAt, String dietaryRestrictions, List<ItemView> items) {
        static PrescriptionView from(Prescription p) {
            return new PrescriptionView(p.getId(), p.getConsultation().getId(), p.getPrescribedAt(), p.getDietaryRestrictions(),
                    p.getItems().stream().map(i -> new ItemView(i.getRemedy().getId(), i.getRemedy().getName(), i.getRemedy().getPotency(), i.getDosage(), i.getRepetition(), i.getDuration())).toList());
        }
    }
    @PostMapping("/consultations/{consultationId}/prescriptions")
    PrescriptionView create(@PathVariable UUID consultationId, @Valid @RequestBody PrescriptionRequest request) {
        var items = request.items().stream().map(i -> new PrescriptionService.Item(i.remedyId(), i.dosage(), i.repetition(), i.duration())).toList();
        return PrescriptionView.from(prescriptions.prescribe(consultationId, request.dietaryRestrictions(), items));
    }
    @GetMapping("/patients/{patientId}/prescriptions")
    List<PrescriptionView> history(@PathVariable UUID patientId) {
        return prescriptions.history(patientId).stream().map(PrescriptionView::from).toList();
    }
}