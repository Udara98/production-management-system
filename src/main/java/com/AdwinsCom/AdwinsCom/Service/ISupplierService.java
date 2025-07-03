package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.SupplierDTO;
import com.AdwinsCom.AdwinsCom.entity.Supplier;
import org.springframework.http.ResponseEntity;

public interface ISupplierService {

    public ResponseEntity<?> AddNewSupplier(SupplierDTO supplierDTO, String userName);
    public ResponseEntity<?> GetAllSuppliers();
    public ResponseEntity<?> UpdateSupplier(SupplierDTO supplierDTO, String userName);
    ResponseEntity<?> DeleteSupplier(Supplier supplier);

}
