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

    @PostMapping("/addNewGRN")
    public ResponseEntity<?> AddNewGRN(@RequestBody GoodReceiveNoteDTO goodReceiveNoteDTO){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return goodReceiveNoteService.AddNewGRN(goodReceiveNoteDTO, auth.getName());
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

    @PutMapping("/updateGRN")
    public ResponseEntity<?> UpdateGRN(@RequestBody GoodReceiveNoteDTO goodReceiveNoteDTO){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return goodReceiveNoteService.UpdateGRN(goodReceiveNoteDTO, auth.getName());
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
}
