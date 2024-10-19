package com.AdwinsCom.AdwinsCom.controller;
import com.AdwinsCom.AdwinsCom.Repository.ModuleRepository;
import com.AdwinsCom.AdwinsCom.entity.Module;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;



@RestController
@RequestMapping(value = "/module")
public class ModuleController {
    
    @Autowired
    private ModuleRepository moduleRepo;

    @GetMapping(value = "/list", produces = "application/json")
    public List<Module> moduleList() {

        return moduleRepo.findAll(Sort.by(Direction.DESC, "id"));
    }

    // get module list by a role_id 
    // 1. QUERY PARAM  ->  { http://localhost:8080/module/listbyrole?roleid=2& }
    @GetMapping(value = "/modulelistbyrole", params = {"roleid"})
    public List<Module> getModulesByRole(@RequestParam("roleid") Integer roleid ) {

        return moduleRepo.getModuleListByRoleId(roleid);
    }

}
