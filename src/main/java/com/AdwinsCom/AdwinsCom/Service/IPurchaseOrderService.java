package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.PurchaseOrderDTO;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface IPurchaseOrderService {

    ResponseEntity<?> AddNewPurchaseOrder(PurchaseOrderDTO purchaseOrderDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> GetAllPurchaseOrders();
    ResponseEntity<?> UpdatePurchaseOrder(PurchaseOrderDTO purchaseOrderDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> DeletePurchaseOrder(Integer Id);

}
