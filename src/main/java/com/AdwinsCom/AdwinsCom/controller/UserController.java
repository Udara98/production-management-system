package com.AdwinsCom.AdwinsCom.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.Service.IUserService;
import com.AdwinsCom.AdwinsCom.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/user")
public class UserController {

    @Autowired
    private IUserService userService;


    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private PrivilegeController privilegeController;


//    @GetMapping
//    public ModelAndView getUserUI(){
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        ModelAndView userView = new ModelAndView();
//        userView.setViewName("settings.html");
//        userView.addObject("username",auth.getName());
//
//
//        return userView;
//    }

    @GetMapping
    public ResponseEntity<ModelAndView> getUserUi(){
            return userService.getUserUi();
        };



//    @GetMapping("/currentUser")
//    public UserPrincipal getUser(@CurrentUser UserPrincipal userPrincipal){}

//    @GetMapping(value = "/findall", produces = "application/json")
//    public List<User> findAll() {
//
//        return userRepository.findAll();
//    }

    @GetMapping(value = "/findall", produces = "application/json")
    public ResponseEntity<?>findall(){
        return userService.findAll();
    }




//    @GetMapping(value = "/findallwithoutadmin", produces = "application/json")
//    public List<User> findallwithoutadmin() {
//
//        return userRepository.findallwithoutadmin();
//    }

    @GetMapping(value = "/findallwithoutadmin", produces = "application/json")
    public ResponseEntity<?>findallwithoutadmin(){
        return userService.findallwithoutadmin();
    }

//    //Define
//    @PostMapping
//    public String saveUSer(@RequestBody User user) {
//        //Authentication and authorization
//        //Get authenticated logged user authentication  object using security contest
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//
//        HashMap<String, Boolean> loguserPrivi =  privilegeController.getPrivilegeByUserModule (auth.getName(), "USER");
//
//        System.out.println(loguserPrivi);
//
//        if(!loguserPrivi.get("insert")){
//            return "User Save not Completed : You haven't Permission..!";
//        }
//
//        //Duplicate email, username, employee
//        User extUserName = userRepository.getUserByUserName(user.getUsername());
//        if (extUserName != null) {
//            return "User Save not completed : Given  User Name Already ext....!";
//        }
//
//        User extUserEmployee = userRepository.getUserByEmployee(user.getEmployee_id().getId());
//        if (extUserEmployee != null) {
//            return "User Save Not completed: Given employee Already Ext..!";
//        }
//
//
//        try {
//            //Set Automatically Added Date time
//            user.setAdded_datetime(LocalDateTime.now());
//            user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
//            userRepository.save(user);
//            return "OK";
//        } catch (Exception e) {
//            return "Save Not Completed :" + e.getMessage();
//
//
//        }
//
//
//    }
    @PostMapping
    public ResponseEntity<String>saveUser(@RequestBody User user){
        return userService.saveUser(user);
    }

//    @DeleteMapping
//    public String deleteUser(@RequestBody User user){
//        // Hard delete
//
//        // userDao.delete(userDao.getReferenceById(user.getId()));
//
//        // extUser -> extUser and front end objects are different
//
//        User extUser = userRepository.getReferenceById(user.getId());
//        if (extUser == null) {
//            return "user delete not completed : user not exist";
//
//        }
//
//        try {
//            extUser.setStatus(false);
//            userRepository.save(extUser);
//
//            return "OK";
//        } catch (Exception e) {
//            return "Delete not completed : " + e.getMessage();
//        }
//    }

    @DeleteMapping
    public ResponseEntity<String> deleteUser(@RequestBody User user) {
        return userService.deleteUser(user);
    }

//    @PutMapping
//    public String updateUser(@RequestBody User user) {
//
//        // authentication and authorization
//
//        // existing with duplicate
//        User extUser = userRepository.getReferenceById(user.getId());
//        if (extUser == null) {
//            return "update not completed : user not existing";
//        }
//
//        User extUserEmail = userRepository.getByEmail(user.getEmail());
//        if (extUserEmail != null && extUserEmail.getId() != user.getId()) {
//            return "Update not completed : Changed email already exists";
//        }
//
//        //Check password exist
//        if( user.getPassword() !=  null){
//            if(bCryptPasswordEncoder.matches(user.getPassword(),extUser.getPassword())){
//                return "Update Not Completed: Change password already existed..!";
//            }
//        }else {
//            user.setPassword(extUser.getPassword());
//        }
//
//        try {
//            // auto set value
//
//            // operator
//
//            // dependencies
//
//            userRepository.save(user);
//
//            return "OK";
//
//        } catch (Exception e) {
//            return "update not completed : "  + e.getMessage();
//        }
//    }

    // Update User Endpoint
    @PutMapping
    public ResponseEntity<String> updateUser(@RequestBody User user) {
        return userService.updateUser(user);
    }

//    //Create function for get user by id
//    @GetMapping(value = "/byid/{id}",produces ="application/json" )
//    public User getById(@PathVariable("id") Integer id){
//        return userRepository.getByIdUser(id);
//    }

    // Get user by Employee ID
    @GetMapping(value = "/byempid/{empid}", produces = "application/json")
    public ResponseEntity<Boolean> getUserByEmpId(@PathVariable("empid") Integer empid) {


        return userService.getUserByEmpId(empid);
    }

    // Get user by User ID
    @GetMapping(value = "/byid/{userid}", produces = "application/json")
    public ResponseEntity<User> getUserById(@PathVariable("userid") int userid) {

        return userService.getUserById(userid);
    }

//    @PostMapping("/uploadPhoto/{userId}")
//    public ResponseEntity<String> uploadUserPhoto(@RequestParam("file") MultipartFile file, @PathVariable int userId) {
//        return userService.uploadUserPhoto(file, userId);
//    }


}
