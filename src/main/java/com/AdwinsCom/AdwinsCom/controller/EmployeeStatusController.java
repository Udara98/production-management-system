package com.AdwinsCom.AdwinsCom.controller;

import com.AdwinsCom.AdwinsCom.Repository.EmployeeStatusDao;
import com.AdwinsCom.AdwinsCom.entity.EmployeeStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/employeestatus")
public class EmployeeStatusController {

    @Autowired
    private EmployeeStatusDao employeeStatusDao;

    @GetMapping(value = "/findall", produces = "application/json")
    public List<EmployeeStatus> findall(){
        return employeeStatusDao.findAll();
    }
}
