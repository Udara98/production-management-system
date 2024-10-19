package com.AdwinsCom.AdwinsCom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@SpringBootApplication
@RestController
public class AdwinsComApplication {

	public static void main(String[] args) {
		SpringApplication.run(AdwinsComApplication.class, args);
		System.out.println("******************************************************");
		System.out.println("****************** Start Application *****************");
		System.out.println("******************************************************");
	}

	@RequestMapping(value = "/settings")
	public ModelAndView settings(){
		ModelAndView settingsUi = new ModelAndView();
		settingsUi.setViewName("settings.html");

		return settingsUi;
	}


}
