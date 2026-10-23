package com.homeoclinic.clinic.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "patients", indexes = @Index(name = "idx_patient_name", columnList = "last_name, first_name"))
public class Patient {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "first_name", nullable = false, length = 100) private String firstName;
    @Column(name = "last_name", nullable = false, length = 100) private String lastName;
    @Column(name = "date_of_birth") private LocalDate dateOfBirth;
    @Column(length = 40) private String gender;
    @Column(length = 30) private String phone;
    @Column(length = 254) private String email;
    @Column(length = 500) private String address;
    @Column(name = "emergency_contact_name", length = 200) private String emergencyContactName;
    @Column(name = "emergency_contact_phone", length = 30) private String emergencyContactPhone;
    @Column(name = "medical_history", columnDefinition = "text") private String medicalHistory;
    @Column(name = "chief_complaints", columnDefinition = "text") private String chiefComplaints;
    @Column(name = "complaint_duration", length = 200) private String complaintDuration;
    @Column(name = "physical_generals", columnDefinition = "text") private String physicalGenerals;
    @Column(columnDefinition = "text") private String appetite;
    @Column(columnDefinition = "text") private String thirst;
    @Column(columnDefinition = "text") private String cravings;
    @Column(columnDefinition = "text") private String aversions;
    @Column(name = "thermal_reaction", columnDefinition = "text") private String thermalReaction;
    @Column(columnDefinition = "text") private String perspiration;
    @Column(columnDefinition = "text") private String sleep;
    @Column(columnDefinition = "text") private String dreams;
    @Column(name = "mental_generals", columnDefinition = "text") private String mentalGenerals;
    @Column(columnDefinition = "text") private String disposition;
    @Column(columnDefinition = "text") private String fears;
    @Column(columnDefinition = "text") private String anxiety;
    @Column(name = "emotional_state", columnDefinition = "text") private String emotionalState;
    @Column(columnDefinition = "text") private String modalities;
    @Column(columnDefinition = "text") private String aggravations;
    @Column(columnDefinition = "text") private String ameliorations;
    @Column(name = "past_history", columnDefinition = "text") private String pastHistory;
    @Column(name = "family_history", columnDefinition = "text") private String familyHistory;
    @Column(nullable = false) private boolean active = true;
    @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;

    protected Patient() {}
    public Patient(String firstName, String lastName, LocalDate dateOfBirth, String gender, String phone, String email,
                   String address, String emergencyContactName, String emergencyContactPhone, String medicalHistory,
                   String chiefComplaints, String complaintDuration, String physicalGenerals, String appetite, String thirst,
                   String cravings, String aversions, String thermalReaction, String perspiration, String sleep, String dreams,
                   String mentalGenerals, String disposition, String fears, String anxiety, String emotionalState,
                   String modalities, String aggravations, String ameliorations, String pastHistory, String familyHistory) {
        this.firstName = firstName; this.lastName = lastName; this.dateOfBirth = dateOfBirth; this.gender = gender;
        this.phone = phone; this.email = email; this.address = address; this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone; this.medicalHistory = medicalHistory;
        this.chiefComplaints = chiefComplaints; this.complaintDuration = complaintDuration;
        this.physicalGenerals = physicalGenerals; this.appetite = appetite; this.thirst = thirst; this.cravings = cravings;
        this.aversions = aversions; this.thermalReaction = thermalReaction; this.perspiration = perspiration;
        this.sleep = sleep; this.dreams = dreams; this.mentalGenerals = mentalGenerals; this.disposition = disposition;
        this.fears = fears; this.anxiety = anxiety; this.emotionalState = emotionalState; this.modalities = modalities;
        this.aggravations = aggravations; this.ameliorations = ameliorations;
        this.pastHistory = pastHistory; this.familyHistory = familyHistory;
    }
    @PrePersist void onCreate() { createdAt = OffsetDateTime.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = OffsetDateTime.now(); }
    public UUID getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public String getGender() { return gender; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getAddress() { return address; }
    public String getEmergencyContactName() { return emergencyContactName; }
    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public String getMedicalHistory() { return medicalHistory; }
    public String getChiefComplaints() { return chiefComplaints; }
    public String getComplaintDuration() { return complaintDuration; }
    public String getPhysicalGenerals() { return physicalGenerals; }
    public String getAppetite() { return appetite; }
    public String getThirst() { return thirst; }
    public String getCravings() { return cravings; }
    public String getAversions() { return aversions; }
    public String getThermalReaction() { return thermalReaction; }
    public String getPerspiration() { return perspiration; }
    public String getSleep() { return sleep; }
    public String getDreams() { return dreams; }
    public String getMentalGenerals() { return mentalGenerals; }
    public String getDisposition() { return disposition; }
    public String getFears() { return fears; }
    public String getAnxiety() { return anxiety; }
    public String getEmotionalState() { return emotionalState; }
    public String getModalities() { return modalities; }
    public String getAggravations() { return aggravations; }
    public String getAmeliorations() { return ameliorations; }
    public String getPastHistory() { return pastHistory; }
    public String getFamilyHistory() { return familyHistory; }
    public boolean isActive() { return active; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void update(Patient source) {
        firstName = source.firstName; lastName = source.lastName; dateOfBirth = source.dateOfBirth;
        gender = source.gender; phone = source.phone; email = source.email; address = source.address;
        emergencyContactName = source.emergencyContactName; emergencyContactPhone = source.emergencyContactPhone;
        medicalHistory = source.medicalHistory; chiefComplaints = source.chiefComplaints;
        complaintDuration = source.complaintDuration; physicalGenerals = source.physicalGenerals;
        appetite = source.appetite; thirst = source.thirst; cravings = source.cravings; aversions = source.aversions;
        thermalReaction = source.thermalReaction; perspiration = source.perspiration; sleep = source.sleep; dreams = source.dreams;
        mentalGenerals = source.mentalGenerals; disposition = source.disposition; fears = source.fears; anxiety = source.anxiety;
        emotionalState = source.emotionalState; modalities = source.modalities;
        aggravations = source.aggravations; ameliorations = source.ameliorations;
        pastHistory = source.pastHistory; familyHistory = source.familyHistory;
    }
}