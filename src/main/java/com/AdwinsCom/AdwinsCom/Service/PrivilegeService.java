package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.Repository.PrivilegeRepository;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.entity.Privilege;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@Service
public class PrivilegeService implements IPrivilegeService {

    @Autowired
    private PrivilegeRepository privilegeRepository;

    @Autowired
    private UserRepository userRepository;



    @Override
    public HashMap<String, Boolean> getPrivilegeByUserModule(String username, String modulename) {

        // HashMap to store privileges as key-value pairs
        HashMap<String, Boolean> userPrivilege = new HashMap<>();

        // If user is an Admin, grant all privileges
        if (username.equals("Admin")) {
            userPrivilege.put("select", true);
            userPrivilege.put("insert", true);
            userPrivilege.put("update", true);
            userPrivilege.put("delete", true);
        } else {
            // Fetch privileges for the user from the repository (ex: "1,1,1,0")
            String userPrivi = privilegeRepository.getPrivilageByUserModule(username, modulename);
            // Split the string to get individual privileges
            String[] userPriviList = userPrivi.split(",");

            // Map the privileges to the HashMap
            userPrivilege.put("select", userPriviList[0].equals("1"));
            userPrivilege.put("insert", userPriviList[1].equals("1"));
            userPrivilege.put("update", userPriviList[2].equals("1"));
            userPrivilege.put("delete", userPriviList[3].equals("1"));
        }

        return userPrivilege; // Return the map of user privileges
    }

    @Override
    public HashMap<String, Boolean> getPrivilegeByLoggedUserModule(String modulename){
        //Get the logged user's authentication object
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // Call the existing method with the logged user's name
        return getPrivilegeByUserModule(auth.getName(), modulename);
    }

    //Get privileges
    @Override
    public ResponseEntity<?> findAll() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        HashMap<String, Boolean> loggedUserPrivi = getPrivilegeByUserModule(auth.getName(),"PRIVILEGE");

        if(!loggedUserPrivi.get("select")){
            return new ResponseEntity<>("You do not have permission to view privileges", HttpStatus.FORBIDDEN);
        }
        List<Privilege>  privileges = privilegeRepository.findAll(Sort.by(Sort.Direction.DESC,"id"));
        return new ResponseEntity<>(privileges,HttpStatus.OK);

    }

    @Override
    public ResponseEntity<ModelAndView> getPrivilegeUi() {
        // Get authenticated logged user authentication object using security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Create the ModelAndView object
        ModelAndView privilegeUi = new ModelAndView();
        privilegeUi.addObject("loginusername", auth.getName());
        privilegeUi.addObject("title", "Employee Management : Privilege Management");
        privilegeUi.setViewName("privilege.html");

        // Return the ModelAndView with an OK status
        return new ResponseEntity<>(privilegeUi, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<String> savePrivilege(Privilege privilege) {
        // Check if privilege already exists for the same role and module
        Privilege existingPrivilege = privilegeRepository.getPrivByRoleModule(privilege.getRole_id().getId(), privilege.getModule_id().getId());
        if (existingPrivilege != null) {
            return new ResponseEntity<>("Save unsuccessful: Entered Privilege for this Role and Module already exists", HttpStatus.CONFLICT);
        }

        try {
            privilege.setAddeddatetime(LocalDateTime.now());
            privilege.setAddeduser(1);
            privilegeRepository.save(privilege);
            return new ResponseEntity<>("Privilege saved successfully", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while saving the privilege: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<String> deletePrivilege(Privilege privilege) {
        // Check if the privilege exists
        Privilege existingPrivilege = privilegeRepository.findById(privilege.getId()).orElse(null);
        if (existingPrivilege == null) {
            return new ResponseEntity<>("Privilege deletion unsuccessful: This privilege does not exist", HttpStatus.NOT_FOUND);
        }

        try {
            // Soft delete logic
            existingPrivilege.setSel(false);
            existingPrivilege.setIns(false);
            existingPrivilege.setUpd(false);
            existingPrivilege.setDel(false);
            existingPrivilege.setDeleteddatetime(LocalDateTime.now());
            existingPrivilege.setDeleteduser(1);
            privilegeRepository.save(existingPrivilege);

            return new ResponseEntity<>("Privilege deleted successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Privilege deletion unsuccessful: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<String> updatePrivilege(Privilege privilege){
        //Check if the privilege exists
        Privilege existingPrivilege = privilegeRepository.findById(privilege.getId()).orElse(null);
        if(existingPrivilege ==null){
            return new ResponseEntity<>("Updating privilege unsuccessful: This privilege does not exist", HttpStatus.NOT_FOUND);
        }
        try {
            //Update the privilege properties as needed
            existingPrivilege.setSel(privilege.getSel());
            existingPrivilege.setIns(privilege.getIns());
            existingPrivilege.setUpd(privilege.getUpd());
            existingPrivilege.setDel(privilege.getDel());
            existingPrivilege.setLastmodifieddatetime(privilege.getLastmodifieddatetime());
            existingPrivilege.setModifieduser(1);
            privilegeRepository.save(existingPrivilege);

             return new ResponseEntity<>("Privilege updated succesfully",HttpStatus.OK);
        } catch (Exception e){
            return new ResponseEntity<>("Updating privilege Unsuccessful: " +e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }



    }






}
