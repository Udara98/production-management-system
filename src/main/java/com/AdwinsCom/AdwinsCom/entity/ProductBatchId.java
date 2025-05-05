package com.AdwinsCom.AdwinsCom.entity;

import jakarta.persistence.Column;
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
public class ProductBatchId implements Serializable {

    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "batch_id")
    private Integer batchId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProductBatchId that = (ProductBatchId) o;
        return Objects.equals(productId, that.productId) &&
                Objects.equals(batchId, that.batchId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, batchId);
    }
}