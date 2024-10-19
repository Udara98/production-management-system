package com.AdwinsCom.AdwinsCom.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/report")
public class ReportController {

    @GetMapping
    public ModelAndView reportModelAndView() {
        ModelAndView reportMV = new ModelAndView();
        reportMV.setViewName("report.html");
        return reportMV;
    }

}
