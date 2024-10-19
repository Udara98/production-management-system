package com.AdwinsCom.AdwinsCom.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import com.AdwinsCom.AdwinsCom.entity.Module;


public interface ModuleRepository extends JpaRepository<Module, Integer> {
    
    // SELECT m.id, m.name FROM adwinscom.module as m where m.id not in (select p.module_id from adwinscom.privilege as p where p.role_id=1);

    // DB - p.module_id  -> type = "Integer"
    // Module.java - p.module_id -> type = "Module"
    
    // select * from adwinscom.module as m where m.id not in (select p.module_id from adwinscom.privilege as p where p.role_id=2 );
    @Query(value = "select m from Module m where m.id not in (select p.module_id.id from Privilege p where p.role_id.id=?1)")
    public List<Module> getModuleListByRoleId(Integer roleid);
}
