package com.AdwinsCom.AdwinsCom.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SupplierPaymentGoodReceiveNoteId implements Serializable {
    private Integer supplierPaymentId;
    private Integer goodReceiveNoteId;

    // MUST override equals() and hashCode()
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SupplierPaymentGoodReceiveNoteId that = (SupplierPaymentGoodReceiveNoteId) o;
        return Objects.equals(supplierPaymentId, that.supplierPaymentId) &&
                Objects.equals(goodReceiveNoteId, that.goodReceiveNoteId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(supplierPaymentId, goodReceiveNoteId);
    }

}