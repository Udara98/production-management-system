package com.AdwinsCom.AdwinsCom.controller;
import com.AdwinsCom.AdwinsCom.entity.User;
import com.AdwinsCom.AdwinsCom.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import java.util.Base64;

@RestController
@RequestMapping(value = "/dashboard")
public class DashboardController {

   @Autowired
   private  UserRepository userRepo;

    @Autowired
    private PrivilegeController privilegeController;

    @GetMapping
    public ModelAndView dashboardModelAndView() {
        ModelAndView dashboardMV = new ModelAndView();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication(); // get logged user object
        User loggedUser = userRepo.getUserByUserName(auth.getName());

        // Convert photo bytes to Base64 if photo exists
        String photoBase64 = null;
        if (loggedUser.getPhoto() != null) {
            photoBase64 = Base64.getEncoder().encodeToString(loggedUser.getPhoto());
        }

        dashboardMV.addObject("loggedUserName", auth.getName());
        dashboardMV.addObject("loggedUserRole", loggedUser.getRoles().iterator().next().getName());    // 'next()' return first role ob
        dashboardMV.addObject("loggedUserPhoto", photoBase64);
        dashboardMV.addObject("topContentTitle", "Dashboard");

        dashboardMV.setViewName("dashboard.html");
        return dashboardMV;
    }
}