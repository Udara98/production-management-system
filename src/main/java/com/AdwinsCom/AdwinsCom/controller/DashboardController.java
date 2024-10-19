package com.AdwinsCom.AdwinsCom.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
@RestController
@RequestMapping(value = "/dashboard")
public class DashboardController {
    @GetMapping
    public ModelAndView dashboardModelAndView() {
        ModelAndView dashboardMV = new ModelAndView();
        dashboardMV.setViewName("dashboard.html");
        return dashboardMV;
    }
}
