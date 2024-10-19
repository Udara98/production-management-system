package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmployeeDao extends JpaRepository<Employee, Integer> {

    //Define query for get next employee number
    @Query(value = "SELECT lpad(max(e.empnumber) + 1, 10, 0) as empno FROM bitprojecttue.employee as e;" , nativeQuery = true)
    public String getNextEmpNo();

    //Define query for get employee by given nic
    @Query(value = "select e from Employee e where e.nic =?1")
    public Employee getEmployeeByNic(String nic);

    //Define query for get employee by given email
    @Query(value = "SELECT e from Employee e where e.email=:email")
    public Employee getEmployeeByEmail(@Param("email") String email);

    //Define query for get employee by given mobile No
    @Query(value = "SELECT e from Employee e where e.mobile=:mobile")
    public Employee getEmployeeByMobile(@Param("mobile") String mobile);

    @Query(value = "SELECT * FROM employee e WHERE e.id NOT IN (SELECT u.employee_id FROM user u)", nativeQuery = true)
    public List<Employee> getEmployeeWithoutUerAccount();



}
