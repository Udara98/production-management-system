package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.GoodReceiveNoteDTO;
import com.AdwinsCom.AdwinsCom.Repository.GoodReceiveNoteRepository;
import com.AdwinsCom.AdwinsCom.entity.GoodReceiveNote;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;

@Service
public class GoodReceiveNoteService implements IGoodReceiveNoteService{

    final GoodReceiveNoteRepository goodReceiveNoteRepository;

    @Autowired
    private IPrivilegeService privilegeService;

    public GoodReceiveNoteService(GoodReceiveNoteRepository goodReceiveNoteRepository) {
        this.goodReceiveNoteRepository = goodReceiveNoteRepository;
    }

    @Override
    public ResponseEntity<?> AddNewGRN(GoodReceiveNoteDTO goodReceiveNoteDTO) throws NoSuchAlgorithmException {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "GRN");

        // If user doesn't have "insert" permission, return 403 Forbidden
        if (!loguserPrivi.get("insert")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("GRN Adds not Completed: You don't have permission!");
        }

        GoodReceiveNote exGoodReceiveNote = goodReceiveNoteRepository.findByPurchaseOrder(goodReceiveNoteDTO.getPurchaseOrder());
        if(exGoodReceiveNote!=null){
            return ResponseEntity.badRequest().body("There is a GRN Available for this Purchase Order.");
        }
        GoodReceiveNote newGoodReceiveNote = new GoodReceiveNote().mapDTO(null,goodReceiveNoteDTO, auth.getName());
        goodReceiveNoteRepository.save(newGoodReceiveNote);

        return ResponseEntity.ok("GRN Added Successfully");
    }

    @Override
    public ResponseEntity<?> UpdateGRN(GoodReceiveNoteDTO goodReceiveNoteDTO) throws NoSuchAlgorithmException {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "GRN");

        // If user doesn't have "insert" permission, return 403 Forbidden
        if (!loguserPrivi.get("update")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("GRN Update not Completed: You don't have permission!");
        }
        GoodReceiveNote goodReceiveNote = goodReceiveNoteRepository.findByGrnNo(goodReceiveNoteDTO.getGrnNo());

        GoodReceiveNote updatedGRN = new GoodReceiveNote().mapDTO(goodReceiveNote,goodReceiveNoteDTO,auth.getName());
        goodReceiveNoteRepository.save(updatedGRN);

        return ResponseEntity.ok("GRN Updated Successfully");
    }

    @Override
    public ResponseEntity<?> GetAllGRNs() {
        List<GoodReceiveNote> goodReceiveNotes = goodReceiveNoteRepository.findByGrnStatusNotRemoved();
        return ResponseEntity.ok(goodReceiveNotes);
    }

    @Override
    public ResponseEntity<?> DeleteGRN(Integer id) {
       GoodReceiveNote goodReceiveNote = goodReceiveNoteRepository.findById(id).get();

       if(goodReceiveNote.getGrnStatus() == GoodReceiveNote.GRNStatus.Pending){
           return ResponseEntity.badRequest().body("Can't Delete Pending GRN");
       }
       goodReceiveNote.setGrnStatus(GoodReceiveNote.GRNStatus.Removed);
       goodReceiveNoteRepository.save(goodReceiveNote);

       return ResponseEntity.ok("GRN Deleted Successfully");
    }
}
