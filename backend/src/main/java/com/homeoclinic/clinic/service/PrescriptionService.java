package com.homeoclinic.clinic.service;

import com.homeoclinic.clinic.domain.Prescription;
import com.homeoclinic.clinic.domain.ConsultationStatus;
import com.homeoclinic.clinic.repository.ConsultationRepository;
import com.homeoclinic.clinic.repository.PrescriptionRepository;
import com.homeoclinic.clinic.repository.RemedyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PrescriptionService {
    public record Item(UUID remedyId, String dosage, String repetition, String duration) {}
    private final PrescriptionRepository prescriptions;
    private final ConsultationRepository consultations;
    private final RemedyRepository remedies;
    public PrescriptionService(PrescriptionRepository prescriptions, ConsultationRepository consultations, RemedyRepository remedies) {
        this.prescriptions = prescriptions; this.consultations = consultations; this.remedies = remedies;
    }
    public Prescription prescribe(UUID consultationId, String dietaryRestrictions, List<Item> items) {
        if (items == null || items.isEmpty() || items.size() > 20)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A prescription must contain 1 to 20 remedies");
        var consultation = consultations.findById(consultationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consultation not found"));
        if (consultation.getStatus() == ConsultationStatus.COMPLETED)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Completed consultations cannot receive new prescriptions");
        var prescription = new Prescription(consultation, dietaryRestrictions);
        for (Item item : items) {
            if (item.remedyId() == null || item.dosage() == null || item.dosage().isBlank() || item.repetition() == null || item.repetition().isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each remedy requires a dosage and repetition schedule");
            var remedy = remedies.findById(item.remedyId()).filter(r -> r.isActive())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Remedy not found"));
            prescription.addItem(remedy, item.dosage().trim(), item.repetition().trim(), item.duration());
        }
        return prescriptions.save(prescription);
    }
    @Transactional(readOnly = true)
    public List<Prescription> history(UUID patientId) {
        return prescriptions.findAllByConsultationPatientIdOrderByPrescribedAtDesc(patientId);
    }
}