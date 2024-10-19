package com.AdwinsCom.AdwinsCom.Service;

import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface IPackageTypeService {

    ResponseEntity<?> AddNewPackageType(String packageType, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> UpdatePackageType(String id,String packageType, String userName);
    ResponseEntity<?> GetAllPackageTypes();
    ResponseEntity<?> DeletePackageType(String id);

}
