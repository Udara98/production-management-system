package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.DTO.GoodReceiveNoteDTO;
import com.AdwinsCom.AdwinsCom.Service.IGoodReceiveNoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/grn")
public class GoodReceiveNoteController {

    final IGoodReceiveNoteService goodReceiveNoteService;

    public GoodReceiveNoteController(IGoodReceiveNoteService goodReceiveNoteService) {
        this.goodReceiveNoteService = goodReceiveNoteService;
    }

    @PostMapping()
    public ResponseEntity<?> AddNewGRN(@RequestBody GoodReceiveNoteDTO goodReceiveNoteDTO){
        try {
            return goodReceiveNoteService.AddNewGRN(goodReceiveNoteDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/getAllGRNs")
    public ResponseEntity<?> GetAllGRNs(){
        try{
            return goodReceiveNoteService.GetAllGRNs();
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping()
    public ResponseEntity<?> UpdateGRN(@RequestBody GoodReceiveNoteDTO goodReceiveNoteDTO){
        try {
            return goodReceiveNoteService.UpdateGRN(goodReceiveNoteDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/deleteGrn/{id}")
    public ResponseEntity<?> DeleteGRN(@PathVariable Integer id){
        try{
            return goodReceiveNoteService.DeleteGRN(id);
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("getGRNBySupId/{supplierId}")
    public ResponseEntity<?> getGRNsBySupplierId(@PathVariable Integer supplierId) {
        return goodReceiveNoteService.getGRNsBySupplierId(supplierId);
    }

    @GetMapping("/get-grn-id/{grnNo}")
    public ResponseEntity<?> getGRNIdByGRNNo(@PathVariable String grnNo) {
        return goodReceiveNoteService.getGRNIdByGRNNo(grnNo);
    }

    @GetMapping("/get-active-non-paid-grns/{supplierId}")
    public ResponseEntity<?> getActiveGRNBySupId(@PathVariable Integer supplierId) {
        return goodReceiveNoteService.getActiveGRNBySupId(supplierId);
    }
}
