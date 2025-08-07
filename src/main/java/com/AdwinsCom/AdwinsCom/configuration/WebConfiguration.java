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
                            .requestMatchers("/resources/**", "/controllerjs/**", "/styles/**", "/bootstrap-5.3.2/**", "/image/**", "/productimages/**", "/fonts/**","/error/**").permitAll()
                            .requestMatchers("/login").permitAll()
                            .requestMatchers("/createadminuser").permitAll()
                            .requestMatchers("/dashboard/**").hasAnyAuthority("Admin", "Manager", "Cashier", "Store-Manager","Procurement-Officer","Production-Manager","Sales-Officer")
                            .requestMatchers("/employee/**").hasAnyAuthority("Admin", "Manager")
                            .requestMatchers("/privilege/**").permitAll()
                            .requestMatchers("/ingredient/**").hasAnyAuthority("Admin","Manager","Procurement-Officer")
                            .requestMatchers("/settings/**").hasAnyAuthority("Admin","Manager")
                            .requestMatchers("/supplier/**").hasAnyAuthority("Admin","Manager","Procurement-Officer")
                            .requestMatchers("/product/**").hasAnyAuthority("Admin","Manager","Cashier")
                            .requestMatchers("/customerOrder/**").hasAnyAuthority("Admin","Manager","Cashier")
                            .requestMatchers("/customerPayment/**").hasAnyAuthority("Admin","Manager")
                            .requestMatchers("/quotation-request/**").hasAnyAuthority("Admin","Manager","Procurement-Officer")
                            .requestMatchers("/user/profile/update").authenticated()
                            .requestMatchers("/user/byname/**").authenticated()
                            .requestMatchers("/quotation/**").hasAnyAuthority("Admin","Manager","Procurement-Officer")
                            .requestMatchers("/user/**").hasAnyAuthority("Admin", "Manager")
                            .requestMatchers("/item/**").hasAnyAuthority("Admin", "Manager")
                            .requestMatchers("/purchaseOrder/**").hasAnyAuthority("Admin", "Manager","Procurement-Officer")
                            .requestMatchers("/grn/**").hasAnyAuthority("Admin", "Manager","Procurement-Officer")
                            .requestMatchers("/supplier_payment/**").hasAnyAuthority("Admin", "Manager","Procurement-Officer")
                            .requestMatchers("/productionItem/**").hasAnyAuthority("Admin","Manager","Production-Manager")
                            .requestMatchers("/batch/getAllBatches").hasAnyAuthority("Cashier","Manager","Admin","Production-Manager")
                            .requestMatchers("/batch/getAllDoneBatches").hasAnyAuthority("Cashier","Manager","Admin","Production-Manager")
                            .requestMatchers("/batch/getBatchesForProduct/**").hasAnyAuthority("Cashier","Manager","Admin","Production-Manager")
                            .requestMatchers("/batch/**").hasAnyAuthority("Admin","Manager","Production-Manager")
                            .requestMatchers("/recipe/**").hasAnyAuthority("Admin","Manager","Production-Manager")
                            .requestMatchers("/report/**").hasAnyAuthority("Admin", "Manager")
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
                ;

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
