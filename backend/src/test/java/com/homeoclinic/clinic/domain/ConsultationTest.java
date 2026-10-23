package com.homeoclinic.clinic.domain;

import org.junit.jupiter.api.Test;
import java.time.OffsetDateTime;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

class ConsultationTest {
    @Test void walkInConsultationCanStartWithoutAppointment() {
        Patient patient = mock(Patient.class);
        Consultation consultation = new Consultation(patient);

        assertThat(consultation.getPatient()).isSameAs(patient);
        assertThat(consultation.getAppointment()).isNull();
        assertThat(consultation.getStatus()).isEqualTo(ConsultationStatus.IN_PROGRESS);
    }

    @Test void closesOnceAndRecordsEndTime() {
        Consultation consultation = new Consultation(mock(Appointment.class));

        consultation.complete();
        OffsetDateTime endedAt = consultation.getEndedAt();
        consultation.complete();

        assertThat(consultation.getStatus()).isEqualTo(ConsultationStatus.COMPLETED);
        assertThat(endedAt).isNotNull();
        assertThat(consultation.getEndedAt()).isEqualTo(endedAt);
    }

    @Test void completedConsultationCannotBeChanged() {
        Consultation consultation = new Consultation(mock(Appointment.class));
        consultation.complete();

        assertThatThrownBy(() -> consultation.updateNotes("new note", null, null))
                .isInstanceOf(IllegalStateException.class);
    }
}