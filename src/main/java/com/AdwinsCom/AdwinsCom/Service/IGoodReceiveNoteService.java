package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.GoodReceiveNoteDTO;
import org.springframework.http.ResponseEntity;

import java.security.NoSuchAlgorithmException;

public interface IGoodReceiveNoteService {

    ResponseEntity<?> AddNewGRN(GoodReceiveNoteDTO goodReceiveNoteDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> UpdateGRN(GoodReceiveNoteDTO goodReceiveNoteDTO, String userName) throws NoSuchAlgorithmException;
    ResponseEntity<?> GetAllGRNs();
    ResponseEntity<?> DeleteGRN(Integer id);
}
