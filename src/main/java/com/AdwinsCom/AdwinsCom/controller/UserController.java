package com.AdwinsCom.AdwinsCom.controller;
import com.AdwinsCom.AdwinsCom.DTO.UserProfileUpdateDTO;
import com.AdwinsCom.AdwinsCom.Service.IUserService;
import com.AdwinsCom.AdwinsCom.entity.User;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
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

    @PostMapping
    public ResponseEntity<String>saveUser(@RequestBody User user){
        return userService.saveUser(user);
    }



    @DeleteMapping
    public ResponseEntity<String> deleteUser(@RequestBody User user) {
        return userService.deleteUser(user);
    }



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

    //Get User by name
    @GetMapping(value = "/byname/{username}",produces = "application/json")
    public ResponseEntity<User> getUserByName(@PathVariable("username") String username){
        return userService.getUserByName(username);
    }

    //Update user Profile

@PutMapping("/profile/update")
public ResponseEntity<String> updateUserProfile(@RequestBody UserProfileUpdateDTO dto, HttpServletRequest request) {


    System.out.println("##############");
    System.out.println("##############");
    System.out.println("##############");

    System.out.println("##############");
    System.out.println("##############");

    System.out.println("##############");
    System.out.println("##############");

    System.out.println("##############");

    System.out.println("Received user profile update request: " + dto);
    ResponseEntity<String> response = userService.updateUserProfile(dto);
    if (response.getStatusCode().is2xxSuccessful()) {
        // Logout user: invalidate session and clear authentication
        try {
            request.getSession().invalidate();
        } catch (Exception ignored) {}
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        return ResponseEntity.ok("User updated successfully. Please log in again.");
    }
    return response;
}




}
