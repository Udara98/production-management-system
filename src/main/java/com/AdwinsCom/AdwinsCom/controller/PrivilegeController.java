package com.AdwinsCom.AdwinsCom.controller;
import com.AdwinsCom.AdwinsCom.Repository.PrivilegeRepository;
import com.AdwinsCom.AdwinsCom.entity.Privilege;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
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


    //Get mapping for generate privilegeUI
    @GetMapping
    public ModelAndView privilegeUi() {
        //Get authenticated logged user authentication  object using security contest
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        ModelAndView privilegeUi = new ModelAndView();
        privilegeUi.addObject("loginusername",auth.getName());
        privilegeUi.addObject("title","Employee Management : Privilege Management");
        privilegeUi.setViewName("privilege.html");

        return privilegeUi;
    }

    //URL -> privilege/findall
    @GetMapping(value = "/findall", produces = "application/json")
    public List<Privilege> findAll() {

        return privilegeRepository.findAll(Sort.by(Sort.Direction.DESC,"id"));
    }

    @PostMapping
    public String savePrivilege(@RequestBody Privilege privilege) {

        // cannot be given privileges to same module and role
        Privilege existingPrivilege = privilegeRepository.getPrivByRoleModule(privilege.getRole_id().getId(), privilege.getModule_id().getId());
        if (existingPrivilege != null) {
            return "Save unsuccessfully : Entered Privilege for this Role and Module already exist";
        }

        try {
            privilege.setAddeddatetime(LocalDateTime.now());
            privilege.setAddeduser(1);
            privilegeRepository.save(privilege);
            return "200";

        } catch (Exception e) {
            return "An error occurred while saving the privilege" + e.getMessage();
        }
    }

    @DeleteMapping
    public String deletePrivilege(@RequestBody Privilege privilege) {

        // check if that privilege exist
        Privilege existingPrivilege = privilegeRepository.getReferenceById(privilege.getId());
        if (existingPrivilege == null) {
            return "Privilege Deletion Unsuccessfully : This privilege does not exist";
        }

        try {

            existingPrivilege.setSel(false);
            existingPrivilege.setIns(false);
            existingPrivilege.setUpd(false);
            existingPrivilege.setDel(false);

            existingPrivilege.setDeleteddatetime(LocalDateTime.now());
            existingPrivilege.setDeleteduser(1);
            privilegeRepository.save(existingPrivilege);
            return "200";

        } catch (Exception e) {
            return "Privilege Deletion Unsuccessfull " + e.getMessage();
        }
    }

    @PutMapping
    public String updatePrivilege(@RequestBody Privilege privilege) {

        // check if that privilege exist
        Privilege existingPrivilege = privilegeRepository.getReferenceById(privilege.getId());
        if (existingPrivilege == null) {
            return "Updating privileges are Unsuccessfull : This privilege does not exist";
        }

        try {
            privilege.setLastmodifieddatetime(LocalDateTime.now());
            privilege.setModifieduser(1);
            privilegeRepository.save(privilege);
            return "200";

        } catch (Exception e) {
            return "Updating privileges are Unsuccessfull " + e.getMessage();
        }
    }




    public HashMap<String, Boolean> getPrivilegeByUserModule(String username , String modulename) {
        HashMap<String, Boolean> userPrivilege = new HashMap<String, Boolean>();
        if (username.equals("Admin")){
            userPrivilege.put("insert",true);
            userPrivilege.put("select",true);
            userPrivilege.put("update",true);
            userPrivilege.put("delete",true);
        } else{
            String userPrivi  = privilegeRepository.getPrivilageByUserModule(username, modulename);
            // 1,1,1,0
            String[] userPrivilist = userPrivi.split(",");
            userPrivilege.put("select", userPrivilist[0].equals("1"));
            userPrivilege.put("insert", userPrivilist[1].equals("1"));
            userPrivilege.put("update", userPrivilist[2].equals("1"));
            userPrivilege.put("delete", userPrivilist[3].equals("1"));
        }
        return userPrivilege;
    }

    // Create GetMapping for get privilege by logged user
    @GetMapping(value = "/byloggedusermodule/{modulename}" ,produces="application/json")
    public HashMap<String,Boolean> getPrivilegeByLoggedUserModule(@PathVariable("modulename") String modulename){

        //Get Logged User by Authentication object
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return getPrivilegeByUserModule(auth.getName(),modulename);

    };


}
