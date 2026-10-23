package com.homeoclinic.clinic.api;

import com.homeoclinic.clinic.domain.Remedy;
import com.homeoclinic.clinic.repository.RemedyRepository;
import com.homeoclinic.clinic.service.RemedyService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/remedies")
@PreAuthorize("hasAnyRole('DOCTOR','STAFF')")
public class RemedyController {
        private final RemedyService remedies;
        public RemedyController(RemedyService remedies) { this.remedies = remedies; }
        public record RemedyRequest(@NotBlank String name, @NotBlank String potency, String form,
            @Min(0) int quantityOnHand, @Min(0) int reorderLevel, BigDecimal unitPrice) {}
    public record RemedyView(UUID id, String name, String potency, String form, int quantityOnHand, int reorderLevel, BigDecimal unitPrice) {
        static RemedyView from(Remedy r) { return new RemedyView(r.getId(), r.getName(), r.getPotency(), r.getForm(), r.getQuantityOnHand(), r.getReorderLevel(), r.getUnitPrice()); }
    }
    @GetMapping List<RemedyView> list() { return remedies.list().stream().map(RemedyView::from).toList(); }
    @org.springframework.web.bind.annotation.PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    RemedyView create(@Valid @RequestBody RemedyRequest request) {
        return RemedyView.from(remedies.create(request.name(), request.potency(), request.form(), request.quantityOnHand(), request.reorderLevel(), request.unitPrice()));
    }
}