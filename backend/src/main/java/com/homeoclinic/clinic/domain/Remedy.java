package com.homeoclinic.clinic.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "remedies", uniqueConstraints = @UniqueConstraint(name = "uk_remedy_name_potency", columnNames = {"name", "potency"}))
public class Remedy {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, length = 200) private String name;
    @Column(nullable = false, length = 30) private String potency;
    @Column(length = 120) private String form;
    @Column(nullable = false) private int quantityOnHand;
    @Column(nullable = false) private int reorderLevel;
    @Column(precision = 10, scale = 2) private BigDecimal unitPrice;
    @Column(nullable = false) private boolean active = true;
    protected Remedy() {}
    public Remedy(String name, String potency, String form, int quantityOnHand, int reorderLevel, BigDecimal unitPrice) {
        this.name = name; this.potency = potency; this.form = form;
        this.quantityOnHand = quantityOnHand; this.reorderLevel = reorderLevel; this.unitPrice = unitPrice;
    }
    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getPotency() { return potency; }
    public String getForm() { return form; }
    public int getQuantityOnHand() { return quantityOnHand; }
    public int getReorderLevel() { return reorderLevel; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public boolean isActive() { return active; }
}