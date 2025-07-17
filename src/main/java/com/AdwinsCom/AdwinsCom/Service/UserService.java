package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.Repository.PrivilegeRepository;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.DTO.UserProfileUpdateDTO;
import com.AdwinsCom.AdwinsCom.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.ModelAndView;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@Service
public class UserService implements IUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PrivilegeRepository privilegeRepository;

    @Autowired
    private IPrivilegeService privilegeService;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;


    // Method to upload user photo
//    public ResponseEntity<String> uploadUserPhoto(MultipartFile file, int userId) {
//        // Check if the user exists
//        User user = userRepository.findById(userId).orElse(null);
//        if (user == null) {
//            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
//        }
//
//        // Check if file is empty
//        if (file.isEmpty()) {
//            return new ResponseEntity<>("No file selected to upload", HttpStatus.BAD_REQUEST);
//        }
//
//        // Construct the file path
//        String fileName = file.getOriginalFilename();
//        String filePath = userProfilePhotoUploadDir + File.separator + fileName;
//
//        try {
//            // Save the file locally
//            Files.copy(file.getInputStream(), Paths.get(filePath));
//
//            // Update the user with the photo path
//            user.setPhoto(filePath);
//            userRepository.save(user);
//
//            return new ResponseEntity<>("Photo uploaded successfully", HttpStatus.OK);
//        } catch (IOException e) {
//            return new ResponseEntity<>("Error uploading file: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }

    @Override
    public ResponseEntity<?> findAll(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        HashMap<String, Boolean> loggedUserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "USER");

        if(!loggedUserPrivi.get("select")){
            return new ResponseEntity<>("You do not have permission to view privileges", HttpStatus.FORBIDDEN);
        }
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC,"id"));
        return new ResponseEntity<>(users,HttpStatus.OK);


    }

    @Override
    public ResponseEntity<ModelAndView> getUserUi() {

        // Create the ModelAndView object
        ModelAndView userMV = new ModelAndView();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User loggedUser = userRepository.getUserByUserName(auth.getName());

        userMV.addObject("loggedusername", auth.getName());
        userMV.addObject("loggeduserrole", loggedUser.getRoles().iterator().next().getName());    // 'next()' return first role ob
        userMV.addObject("loggeduserphoto", loggedUser.getPhoto());
        userMV.addObject("topcontenttitle", "User Management");

        userMV.setViewName("user.html");
        return new ResponseEntity<>(userMV, HttpStatus.OK);




    }

    @Override
    public ResponseEntity<?> findallwithoutadmin() {
        try {
            List<User> users = userRepository.findallwithoutadmin();

            // Check if the list is empty and return 204 No Content
            if (users.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No users found");
            }

            // Return 200 OK with the list of users
            return ResponseEntity.ok(users);


        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error occurred: " + e.getMessage());
        }
    }

    

    @Override
    public ResponseEntity<String> saveUser(User user) {
        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "USER");

        // If user doesn't have "insert" permission, return 403 Forbidden
        if (!loguserPrivi.get("insert")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("User Save not Completed: You don't have permission!");
        }

        // Check for duplicate username
        User extUserName = userRepository.getUserByUserName(user.getUsername());
        if (extUserName != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("User Save not completed: Given User Name already exists!");
        }

        // Check for duplicate employee ID
        User extUserEmployee = userRepository.getUserByEmployee(user.getEmployee_id().getId());
        if (extUserEmployee != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("User Save not completed: Given employee already exists!");
        }

        try {
            // Set automatically added date-time and encrypt password
            user.setAdded_datetime(LocalDateTime.now());
            user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));

            // Save the user to the database
            userRepository.save(user);

            // Return 201 Created on successful save
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("User saved successfully!");

        } catch (Exception e) {
            // Handle any exceptions and return 500 Internal Server Error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Save not completed: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<String> deleteUser(User user) {

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "USER");

        // If user doesn't have "delete" permission, return 403 Forbidden
        if (!loguserPrivi.get("delete")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("User delete not Completed: You don't have permission!");
        }


        // Check if the user exists
        User extUser = userRepository.findById(user.getId()).orElse(null);

        // If the user does not exist, return 404 Not Found
        if (extUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User deletion not completed: User does not exist.");
        }

        try {
            // Soft delete by setting the status to false
            extUser.setStatus(false);
            extUser.setDeleteddatetime(LocalDateTime.now());
            extUser.setDeleteduser(userRepository.getUserByUserName(auth.getName()).getId());
            userRepository.save(extUser);

            // Return 200 OK when deletion is successful
            return ResponseEntity.status(HttpStatus.OK)
                    .body("User deleted successfully.");
        } catch (Exception e) {
            // Handle any exceptions and return 500 Internal Server Error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("User deletion not completed: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<String>updateUser(User user){

        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "USER");

        // If user doesn't have "delete" permission, return 403 Forbidden
        if (!loguserPrivi.get("update")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("User update not Completed: You don't have permission!");
        }

        //  Check if the user exists
        User extUser = userRepository.findById(user.getId()).orElse(null);

        if (extUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Update not completed: User does not exist.");
        }

        // Check if the email is already used by another user
        User extUserEmail = userRepository.getByEmail(user.getEmail());
        if (extUserEmail != null && !extUserEmail.getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Update not completed: Email already exists.");
        }

        // Check if the password is being changed and ensure it's not the same as the current one
        if (user.getPassword() != null) {
            if (bCryptPasswordEncoder.matches(user.getPassword(), extUser.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Your new password cannot be the same as your current password. Please choose a different password.");
            } else {
                // Encrypt and update the new password
                user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
            }
        } else {
            // If password not changed, retain the old password
            user.setPassword(extUser.getPassword());
        }

        try {
            // Save updated user
            user.setLastmodifieddatetime(LocalDateTime.now());
            user.setModifieduser(userRepository.getUserByUserName(auth.getName()).getId());
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.OK).body("User updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Update not completed: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Boolean> getUserByEmpId(Integer empid) {
        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "USER");

        // If user doesn't have "delete" permission, return 403 Forbidden
        if (!loguserPrivi.get("select")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);

        }
        try {
            // Fetch user by employee ID
            User userByEmpId = userRepository.getUserByEmployee(empid);
            if (userByEmpId != null) {
                return ResponseEntity.status(HttpStatus.OK).body(true);  // User found, return true
            } else {
                return ResponseEntity.status(HttpStatus.OK).body(false); // User not found, return false
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null); // Handle exception
        }
    }

    @Override
    public ResponseEntity<User> getUserById(int userid) {
        // Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get privileges for the logged-in user
        HashMap<String, Boolean> loguserPrivi = privilegeService.getPrivilegeByUserModule(auth.getName(), "USER");

        // If user doesn't have "delete" permission, return 403 Forbidden
        if (!loguserPrivi.get("select")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);

        }
        try {
            // Fetch user by ID
            User user = userRepository.findById(userid).orElse(null);
            if (user != null) {
                return ResponseEntity.status(HttpStatus.OK).body(user);  // Return the found user
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);  // User not found
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null); // Handle exception
        }
    }

    @Override
    public ResponseEntity<User> getUserByName(String username) {
        return ResponseEntity.ok(userRepository.getUserByUserName(username));
    }

    @Override
    public ResponseEntity<String> updateUserProfile(UserProfileUpdateDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String loggedInUsername = auth.getName();

        // Fetch the logged-in user entity
        User extUser = userRepository.getUserByUserName(loggedInUsername);
        if (extUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Update not completed: User does not exist.");
        }

        // Only update fields present in the DTO
        if (dto.getUsername() != null && !dto.getUsername().equals(extUser.getUsername())) {
            extUser.setUsername(dto.getUsername());
        }
        if (dto.getEmail() != null && !dto.getEmail().equals(extUser.getEmail())) {
            User extUserEmail = userRepository.getByEmail(dto.getEmail());
            if (extUserEmail != null && !extUserEmail.getUsername().equals(loggedInUsername)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Update not completed: Email already exists.");
            }
            extUser.setEmail(dto.getEmail());
        }
        if (dto.getPhoto() != null) {
            try {
                byte[] photoBytes = java.util.Base64.getDecoder().decode(dto.getPhoto());
                extUser.setPhoto(photoBytes);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid photo data: must be base64 encoded.");
            }
        }
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            if (!bCryptPasswordEncoder.matches(dto.getPassword(), extUser.getPassword())) {
                extUser.setPassword(bCryptPasswordEncoder.encode(dto.getPassword()));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Your new password cannot be the same as your current password. Please choose a different password.");
            }
        }

        try {
            extUser.setLastmodifieddatetime(LocalDateTime.now());
            extUser.setModifieduser(extUser.getId());
            userRepository.save(extUser);
            return ResponseEntity.status(HttpStatus.OK).body("User updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Update not completed: " + e.getMessage());
        }
    }
    }




