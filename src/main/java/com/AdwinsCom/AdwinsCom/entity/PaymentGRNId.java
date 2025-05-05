package com.AdwinsCom.AdwinsCom.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public class PaymentGRNId implements Serializable {
    private Long paymentId;
    private String grnId;
}
