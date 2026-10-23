package com.homeoclinic.clinic.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "prescription_items")
public class PrescriptionItem {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "prescription_id", nullable = false) private Prescription prescription;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "remedy_id", nullable = false) private Remedy remedy;
    @Column(nullable = false, length = 250) private String dosage;
    @Column(nullable = false, length = 250) private String repetition;
    @Column(length = 200) private String duration;
    protected PrescriptionItem() {}
    public PrescriptionItem(Prescription prescription, Remedy remedy, String dosage, String repetition, String duration) {
        this.prescription = prescription; this.remedy = remedy; this.dosage = dosage; this.repetition = repetition; this.duration = duration;
    }
    public UUID getId() { return id; }
    public Remedy getRemedy() { return remedy; }
    public String getDosage() { return dosage; }
    public String getRepetition() { return repetition; }
    public String getDuration() { return duration; }
}