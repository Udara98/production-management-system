package com.AdwinsCom.AdwinsCom.controller;
import com.AdwinsCom.AdwinsCom.Repository.PrivilegeRepository;
import com.AdwinsCom.AdwinsCom.Service.IPrivilegeService;
import com.AdwinsCom.AdwinsCom.entity.Privilege;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/privilege")
public class PrivilegeController {

    @Autowired
    private PrivilegeRepository privilegeRepository;

    @Autowired
    private IPrivilegeService privilegeService;



    @GetMapping
    public ResponseEntity<ModelAndView> privilegeUi() {
            return privilegeService.getPrivilegeUi();
        }


    @GetMapping(value = "/findall", produces = "application/json")
    public ResponseEntity<?> findall() {
        return privilegeService.findAll(); // Delegates response handling to service
    }



    @PostMapping
    public ResponseEntity<String> savePrivilege(@RequestBody Privilege privilege) {
        return privilegeService.savePrivilege(privilege);
    }

    @DeleteMapping
    public ResponseEntity<String> deletePrivilege(@RequestBody Privilege privilege) {
        return privilegeService.deletePrivilege(privilege);
    }

    @PutMapping
    public ResponseEntity<String> updatePrivilege(@RequestBody Privilege privilege){
            return privilegeService.updatePrivilege(privilege);
    }

    @GetMapping(value = "/byloggedusermodule/{modulename}", produces = "application/json")
    public ResponseEntity<HashMap<String, Boolean>> getPrivilegeByLoggedUserModule(@PathVariable("modulename") String modulename) {
        HashMap<String, Boolean> privileges = privilegeService.getPrivilegeByLoggedUserModule(modulename);
        return ResponseEntity.ok(privileges);
    }

//    @DeleteMapping
//    public String deletePrivilege(@RequestBody Privilege privilege) {
//
//        // check if that privilege exist
//        Privilege existingPrivilege = privilegeRepository.getReferenceById(privilege.getId());
//        if (existingPrivilege == null) {
//            return "Privilege Deletion Unsuccessfully : This privilege does not exist";
//        }
//
//        try {
//
//            existingPrivilege.setSel(false);
//            existingPrivilege.setIns(false);
//            existingPrivilege.setUpd(false);
//            existingPrivilege.setDel(false);
//
//            existingPrivilege.setDeleteddatetime(LocalDateTime.now());
//            existingPrivilege.setDeleteduser(1);
//            privilegeRepository.save(existingPrivilege);
//            return "200";
//
//        } catch (Exception e) {
//            return "Privilege Deletion Unsuccessfull " + e.getMessage();
//        }
//    }

//    @PutMapping
//    public String updatePrivilege(@RequestBody Privilege privilege) {
//
//        // check if that privilege exist
//        Privilege existingPrivilege = privilegeRepository.getReferenceById(privilege.getId());
//        if (existingPrivilege == null) {
//            return "Updating privileges are Unsuccessfull : This privilege does not exist";
//        }
//
//        try {
//            privilege.setLastmodifieddatetime(LocalDateTime.now());
//            privilege.setModifieduser(1);
//            privilegeRepository.save(privilege);
//            return "200";
//
//        } catch (Exception e) {
//            return "Updating privileges are Unsuccessfull " + e.getMessage();
//        }
//    }









//    public HashMap<String, Boolean> getPrivilegeByUserModule(String username , String modulename) {
//        HashMap<String, Boolean> userPrivilege = new HashMap<String, Boolean>();
//        if (username.equals("Admin")){
//            userPrivilege.put("insert",true);
//            userPrivilege.put("select",true);
//            userPrivilege.put("update",true);
//            userPrivilege.put("delete",true);
//        } else{
//            String userPrivi  = privilegeRepository.getPrivilageByUserModule(username, modulename);
//            // 1,1,1,0
//            String[] userPrivilist = userPrivi.split(",");
//            userPrivilege.put("select", userPrivilist[0].equals("1"));
//            userPrivilege.put("insert", userPrivilist[1].equals("1"));
//            userPrivilege.put("update", userPrivilist[2].equals("1"));
//            userPrivilege.put("delete", userPrivilist[3].equals("1"));
//        }
//        return userPrivilege;
//    }

// Create GetMapping for get privilege by logged user
//    @GetMapping(value = "/byloggedusermodule/{modulename}" ,produces="application/json")
//    public HashMap<String,Boolean> getPrivilegeByLoggedUserModule(@PathVariable("modulename") String modulename){
//
//        //Get Logged User by Authentication object
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        return getPrivilegeByUserModule(auth.getName(),modulename);
//
//    };


}
