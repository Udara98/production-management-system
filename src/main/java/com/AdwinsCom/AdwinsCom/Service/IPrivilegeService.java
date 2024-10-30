package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.Repository.PrivilegeRepository;
import com.AdwinsCom.AdwinsCom.entity.Privilege;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.ModelAndView;

import java.util.HashMap;

public interface IPrivilegeService {

    ResponseEntity<?>findAll();
    ResponseEntity<ModelAndView> getPrivilegeUi();
    HashMap<String, Boolean> getPrivilegeByUserModule(String username, String modulename);
    HashMap<String, Boolean> getPrivilegeByLoggedUserModule(String modulename);
    ResponseEntity<String> savePrivilege(Privilege privilege);
    ResponseEntity<String>deletePrivilege(Privilege privilege);
    ResponseEntity<String>updatePrivilege(Privilege privilege);








}
