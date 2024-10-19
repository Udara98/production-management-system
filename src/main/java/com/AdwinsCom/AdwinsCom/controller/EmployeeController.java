package com.AdwinsCom.AdwinsCom.controller;

import java.time.LocalDateTime;
import java.util.List;

import com.AdwinsCom.AdwinsCom.Repository.EmployeeDao;
import com.AdwinsCom.AdwinsCom.Repository.EmployeeStatusDao;

import com.AdwinsCom.AdwinsCom.entity.Employee;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping(value = "/employee") // --> Class Level Mapping
public class EmployeeController {

    //Create employeedao Object
    @Autowired
    private EmployeeDao employeeDao;

    //Create employeeStatusDao object

    @Autowired
    private EmployeeStatusDao employeeStatusDao;



    // produce -> data return type (could be xml json text)
    @GetMapping(value = "/findall", produces = "application/json")
    public List<Employee> findAll() {

        return employeeDao.findAll(Sort.by(Sort.Direction.DESC,"id"));
    }

    //Create get mapping for get employee list without user account
    @GetMapping(value = "/listwithoutuseraccount", produces = "application/json")
    public List<Employee> employeeListWithoutUserAccount(){
        return employeeDao.getEmployeeWithoutUerAccount();
    }



    @GetMapping
    public ModelAndView employee() {

        ModelAndView employeeView = new ModelAndView();
        employeeView.setViewName("settings.html");

        return employeeView;
    }

    @PostMapping
    public String saveEmployee(@RequestBody Employee employee){

        Employee extEmpByNic = employeeDao.getEmployeeByNic(employee.getNic());
        if(extEmpByNic != null){
            return "Save Not Completed: GIven NIc Already Exist";
        }

        Employee extEmpByMobile = employeeDao.getEmployeeByEmail(employee.getMobile());
        if(extEmpByMobile != null) {
            return "Save Not Completed: GIven Mobile Already Exist";
        }

        Employee extEmpByEmail = employeeDao.getEmployeeByEmail(employee.getEmail());
        if(extEmpByEmail != null){
            return "Save Not Completed: GIven Email Already Exist";
        }

        try{
            employee.setAdded_datetime(LocalDateTime.now());
            //emp no  generated
            String nextEmpNo = employeeDao.getNextEmpNo();

            //If Database records empty set Empnumber to 0000000001
            if(nextEmpNo.isEmpty()|| nextEmpNo.equals(null)){
                employee.setEmpnumber("0000000001");
            }else {
                employee.setEmpnumber(nextEmpNo);
            }
            employeeDao.save(employee);
//            return "OK";
            return nextEmpNo;

        } catch (Exception e){
            return "Save not Completed" + e.getMessage();
        }
    }

    //Define server mapping for delete request
    @DeleteMapping
    public String delete (@RequestBody Employee employee){

        Employee extEmployee = employeeDao.getReferenceById(employee.getId());
        if(extEmployee==null){
            return "Delete not completed: Employee not ext!... ";
        }
        try {

            //Hard Delete
//            employeeDao.delete(employeeDao.getReferenceById(employee.getId()));

            extEmployee.setEmployeestatus_id(employeeStatusDao.getReferenceById(3));
            employeeDao.save(extEmployee);
            return "OK";

        }catch (Exception e){
            return "Delete Not Completed : " +e.getMessage();

        }

    }

    //Define mapping for update employee
    @PutMapping
    public String update (@RequestBody Employee employee){
        try {
            employeeDao.save(employee);
            return "OK";

        }
        catch (Exception e){
            return  "Update Not Complete:" + e.getMessage();

        }

    }




}

