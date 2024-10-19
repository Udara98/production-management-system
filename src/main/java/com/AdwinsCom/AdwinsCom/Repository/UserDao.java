package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserDao extends JpaRepository<User,Integer> {

    @Query(value = "select u from User  u where u.email=?1")
    User getByEmail(String email);

    @Query(value = "select u from User u where u.username=?1")
    public User getUserByUserName (String username);

    @Query("select u from User u where u.username<> 'Admin' order by u.id desc")
    List<User> findallwithoutadmin();


    //Create Query for get user by given employee
    @Query("select u from User u where u.employee_id.id =?1")
    public User getUserByEmployee (Integer id);

    @Query("select new User(u.id,u.username) from User u where u.id=?1")
    public User getByIdUser(Integer id);




}
