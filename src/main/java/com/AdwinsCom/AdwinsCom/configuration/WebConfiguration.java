package com.AdwinsCom.AdwinsCom.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class WebConfiguration {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.authorizeHttpRequests((auth) -> {
                    auth
                            .requestMatchers("/resources/**", "/controllerjs/**", "/styles/**", "/bootstrap-5.3.2/**", "/image/**", "/productimages/**", "/fonts/**").permitAll()
                            .requestMatchers("/login").permitAll()
                            .requestMatchers("/createadminuser").permitAll()
                            .requestMatchers("/dashboard/**").hasAnyAuthority("Admin", "Manager", "Cashier", "Store-Manager","Procurement Officer")
                            .requestMatchers("/employee/**").hasAnyAuthority("Admin", "Manager")
                            .requestMatchers("/privilege/**").permitAll()
                            .requestMatchers("/ingredient/**").hasAnyAuthority("Admin")
                            .requestMatchers("/supplier/**").hasAnyAuthority("Admin")
                            .requestMatchers("/product/**").hasAnyAuthority("Admin","Cashier","Sales-Officer","Store-Manager","Procurement Officer")
                            .requestMatchers("/customerOrder/**").hasAnyAuthority("Admin","Procurement Officer","Cashier","Sales-Officer","Store-Manager")
                            .requestMatchers("/customerPayment/**").hasAnyAuthority("Admin","Cashier")
                            .requestMatchers("/quotation-request/**").hasAnyAuthority("Admin")
                            .requestMatchers("/user/profile/update").authenticated()
                            .requestMatchers("/user/byname/**").authenticated()
                            .requestMatchers("/quotation/**").hasAnyAuthority("Admin")
                            .requestMatchers("/user/**").hasAnyAuthority("Admin", "Manager")
                            .requestMatchers("/item/**").hasAnyAuthority("Admin", "Manager", "Cashier", "Store-Manager")
                     
                            
                            .anyRequest().authenticated();
                })
                .formLogin((login) -> {
                    login
                            .loginPage("/login")
                            .usernameParameter("username")
                            .passwordParameter("password")
                            .defaultSuccessUrl("/dashboard", true)
                            .failureUrl("/login?error=invalidusernamepassword");
                })
                .logout((logout) -> {
                    logout
                            .logoutUrl("/logout")
                            .logoutSuccessUrl("/login");
                })
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exp -> exp.accessDeniedPage("/errors"));

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
