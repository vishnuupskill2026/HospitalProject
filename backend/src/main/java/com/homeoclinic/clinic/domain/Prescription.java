package com.homeoclinic.clinic.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "prescriptions")
public class Prescription {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "consultation_id", nullable = false) private Consultation consultation;
    @Column(nullable = false) private OffsetDateTime prescribedAt;
    @Column(name = "dietary_restrictions", columnDefinition = "text") private String dietaryRestrictions;
    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true) private List<PrescriptionItem> items = new ArrayList<>();
    protected Prescription() {}
    public Prescription(Consultation consultation, String dietaryRestrictions) {
        this.consultation = consultation; this.dietaryRestrictions = dietaryRestrictions; this.prescribedAt = OffsetDateTime.now();
    }
    public void addItem(Remedy remedy, String dosage, String repetition, String duration) {
        items.add(new PrescriptionItem(this, remedy, dosage, repetition, duration));
    }
    public UUID getId() { return id; }
    public Consultation getConsultation() { return consultation; }
    public OffsetDateTime getPrescribedAt() { return prescribedAt; }
    public String getDietaryRestrictions() { return dietaryRestrictions; }
    public List<PrescriptionItem> getItems() { return List.copyOf(items); }
}