package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.UserProfileUpdateDTO;

import com.AdwinsCom.AdwinsCom.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

public interface IUserService {
    ResponseEntity<?> findAll();
    ResponseEntity<ModelAndView> getUserUi();
    ResponseEntity<?>findallwithoutadmin();
    ResponseEntity<String> saveUser(User user);
    ResponseEntity<String>deleteUser(User user);
    ResponseEntity<String>updateUser(User user);
    ResponseEntity<Boolean> getUserByEmpId(Integer empid);
    ResponseEntity<User> getUserById(int userid);
    ResponseEntity<User> getUserByName(String username);
    ResponseEntity<String> updateUserProfile(UserProfileUpdateDTO dto);






}
