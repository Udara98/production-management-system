package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.Repository.DesignationDao;
import com.AdwinsCom.AdwinsCom.entity.Designation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/designation")
public class DesignationController {

    @Autowired
    private DesignationDao designationDao;

    @GetMapping(value = "/findall", produces = "application/json")
    private List<Designation> findall(){
        return designationDao.findAll();
    }
}
