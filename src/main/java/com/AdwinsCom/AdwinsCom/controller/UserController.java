package com.AdwinsCom.AdwinsCom.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

import com.AdwinsCom.AdwinsCom.Repository.UserDao;
import com.AdwinsCom.AdwinsCom.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/user")
public class UserController {
    @Autowired
    private UserDao userDao;


    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private PrivilegeController privilegeController;


    @GetMapping
    public ModelAndView userUI(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        ModelAndView userView = new ModelAndView();
        userView.setViewName("settings.html");
        userView.addObject("username",auth.getName());


        return userView;
    }

//    @GetMapping("/currentUser")
//    public UserPrincipal getUser(@CurrentUser UserPrincipal userPrincipal){}

    @GetMapping(value = "/findall", produces = "application/json")
    public List<User> findAll() {

        return userDao.findAll();
    }
    @GetMapping(value = "/findallwithoutadmin", produces = "application/json")
    public List<User> findallwithoutadmin() {

        return userDao.findallwithoutadmin();
    }

    //Define
    @PostMapping
    public String saveUSer(@RequestBody User user) {
        //Authentication and authorization
        //Get authenticated logged user authentication  object using security contest
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        HashMap<String, Boolean> loguserPrivi =  privilegeController.getPrivilegeByUserModule (auth.getName(), "USER");

        System.out.println(loguserPrivi);

        if(!loguserPrivi.get("insert")){
            return "User Save not Completed : You haven't Permission..!";
        }

        //Duplicate email, username, employee
        User extUserName = userDao.getUserByUserName(user.getUsername());
        if (extUserName != null) {
            return "User Save not completed : Given  User Name Already ext....!";
        }

        User extUserEmployee = userDao.getUserByEmployee(user.getEmployee_id().getId());
        if (extUserEmployee != null) {
            return "User Save Not completed: Given employee Already Ext..!";
        }


        try {
            //Set Automatically Added Date time
            user.setAdded_datetime(LocalDateTime.now());
            user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
            userDao.save(user);
            return "OK";
        } catch (Exception e) {
            //TODO Handle Exception
            return "Save Not Completed :" + e.getMessage();


        }


    }

    @DeleteMapping
    public String deleteUser(@RequestBody User user){
        // Hard delete

        // userDao.delete(userDao.getReferenceById(user.getId()));

        // extUser -> extUser and front end objects are different

        User extUser = userDao.getReferenceById(user.getId());
        if (extUser == null) {
            return "user delete not completed : user not exist";

        }

        try {
            extUser.setStatus(false);
            userDao.save(extUser);

            return "OK";
        } catch (Exception e) {
            return "Delete not completed : " + e.getMessage();
        }
    }

    @PutMapping
    public String updateUser(@RequestBody User user) {

        // authentication and authorization

        // existing with duplicate
        User extUser = userDao.getReferenceById(user.getId());
        if (extUser == null) {
            return "update not completed : user not existing";
        }

        User extUserEmail = userDao.getByEmail(user.getEmail());
        if (extUserEmail != null && extUserEmail.getId() != user.getId()) {
            return "Update not completed : Changed email already exists";
        }

        //Check password exist
        if( user.getPassword() !=  null){
            if(bCryptPasswordEncoder.matches(user.getPassword(),extUser.getPassword())){
                return "Update Not Completed: Change password already existed..!";
            }
        }else {
            user.setPassword(extUser.getPassword());
        }

        try {
            // auto set value

            // operator

            // dependencies

            userDao.save(user);

            return "OK";

        } catch (Exception e) {
            return "update not completed : "  + e.getMessage();
        }
    }

    //Create function for get user by id
    @GetMapping(value = "/byid/{id}",produces ="application/json" )
    public User getById(@PathVariable("id") Integer id){
        return userDao.getByIdUser(id);
    }


}
