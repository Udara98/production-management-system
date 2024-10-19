package com.AdwinsCom.AdwinsCom.security;

import com.AdwinsCom.AdwinsCom.Repository.UserDao;
import com.AdwinsCom.AdwinsCom.entity.Role;
import com.AdwinsCom.AdwinsCom.entity.User;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@Transactional
public class MyUserDetailService implements UserDetailsService {

    // inject dependency 
    @Autowired
    private UserDao userDao;

    // MyUserDetailService created for ->  get User details (in User Authentication)

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        User user = userDao.getUserByUserName(username);   // get user object using user dao by given username

        ArrayList<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();

        for(Role role : user.getRoles()) {
            authorities.add(new SimpleGrantedAuthority(role.getName()));
        }

        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), user.getStatus(), true, true, true, authorities);

    }
    
}
