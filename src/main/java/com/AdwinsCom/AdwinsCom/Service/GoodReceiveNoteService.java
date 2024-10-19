package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.GoodReceiveNoteDTO;
import com.AdwinsCom.AdwinsCom.Repository.GoodReceiveNoteRepository;
import com.AdwinsCom.AdwinsCom.entity.GoodReceiveNote;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.NoSuchAlgorithmException;
import java.util.List;

@Service
public class GoodReceiveNoteService implements IGoodReceiveNoteService{

    final GoodReceiveNoteRepository goodReceiveNoteRepository;

    public GoodReceiveNoteService(GoodReceiveNoteRepository goodReceiveNoteRepository) {
        this.goodReceiveNoteRepository = goodReceiveNoteRepository;
    }

    @Override
    public ResponseEntity<?> AddNewGRN(GoodReceiveNoteDTO goodReceiveNoteDTO, String userName) throws NoSuchAlgorithmException {
        GoodReceiveNote exGoodReceiveNote = goodReceiveNoteRepository.findByPurchaseOrder(goodReceiveNoteDTO.getPurchaseOrder());
        if(exGoodReceiveNote!=null){
            return ResponseEntity.badRequest().body("There is a GRN Available for this Purchase Order.");
        }
        GoodReceiveNote newGoodReceiveNote = new GoodReceiveNote().mapDTO(null,goodReceiveNoteDTO, userName);
        goodReceiveNoteRepository.save(newGoodReceiveNote);

        return ResponseEntity.ok("GRN Added Successfully");
    }

    @Override
    public ResponseEntity<?> UpdateGRN(GoodReceiveNoteDTO goodReceiveNoteDTO, String userName) throws NoSuchAlgorithmException {
        GoodReceiveNote goodReceiveNote = goodReceiveNoteRepository.findByGrnNo(goodReceiveNoteDTO.getGrnNo());

        GoodReceiveNote updatedGRN = new GoodReceiveNote().mapDTO(goodReceiveNote,goodReceiveNoteDTO,userName);
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
