package com.AdwinsCom.AdwinsCom.controller;
import com.AdwinsCom.AdwinsCom.Repository.RoleDao;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import com.AdwinsCom.AdwinsCom.entity.Role;
import com.AdwinsCom.AdwinsCom.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@RestController
public class LoginController {

    @Autowired
	private BCryptPasswordEncoder bCryptPasswordEncoder;

	@Autowired
	private RoleDao daoRole;

	@Autowired
	private UserRepository userRepository;

    @GetMapping(value = "/login")
    public ModelAndView loginUI() {
        //Get authenticated logged user authentication  object using security contest
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        ModelAndView loginView = new ModelAndView();
        loginView.setViewName("login.html");
        loginView.addObject("username",auth.getName());


        return loginView;
    }

    @GetMapping(value = "/createadminuser")
    public String generateAdminAccount() {

    User extAdminUser = userRepository.getUserByUserName("Admin");
		if (extAdminUser == null) {

            // System.out.println(extAdminUser.equals(null));

            User adminUser = new User();
            adminUser.setUsername("Admin");
            adminUser.setPassword(bCryptPasswordEncoder.encode("1234"));
            adminUser.setEmail("admin@gmail.com");
            adminUser.setAdded_datetime(LocalDateTime.now());
            adminUser.setStatus(true);
            adminUser.setEmployee_id(null);
            adminUser.setPhoto(null);

            Set<Role> userRoles = new HashSet<Role>();
            userRoles.add(daoRole.getReferenceById(1));
            adminUser.setRoles(userRoles);

            userRepository.save(adminUser);


		}
        return "<script> window.location.replace('/login'); </script>";
    }    
}
