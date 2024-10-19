package com.AdwinsCom.AdwinsCom.controller;


import com.AdwinsCom.AdwinsCom.Repository.RoleDao;
import com.AdwinsCom.AdwinsCom.entity.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/role")
public class RoleController {
    @Autowired
    private RoleDao RoleDao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<Role> findAll() {

        return RoleDao.findAll();
    }
}
