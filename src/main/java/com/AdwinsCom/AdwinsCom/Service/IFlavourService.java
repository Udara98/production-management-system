package com.AdwinsCom.AdwinsCom.Service;

import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface IFlavourService {

    ResponseEntity<?> AddNewFlavour(String flavourName, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> UpdateFlavour(String id,String flavourName, String userName);
    ResponseEntity<?> GetAllFlavours();
    ResponseEntity<?> DeleteFlavour(String id);


}
