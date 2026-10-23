package com.homeoclinic.clinic.service;

import com.homeoclinic.clinic.domain.Remedy;
import com.homeoclinic.clinic.repository.RemedyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RemedyService {
    private final RemedyRepository remedies;
    public RemedyService(RemedyRepository remedies) { this.remedies = remedies; }
    @Transactional(readOnly = true)
    public List<Remedy> list() { return remedies.findAllByActiveTrueOrderByNameAsc(); }
    public Remedy create(String name, String potency, String form, int quantityOnHand, int reorderLevel, BigDecimal unitPrice) {
        if (quantityOnHand < 0 || reorderLevel < 0 || (unitPrice != null && (unitPrice.signum() < 0 || unitPrice.scale() > 2)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock, reorder level, and unit price must be non-negative");
        return remedies.save(new Remedy(name.trim(), potency.trim(), form, quantityOnHand, reorderLevel, unitPrice));
    }
}