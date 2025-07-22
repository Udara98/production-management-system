package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.Privilege;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PrivilegeRepository extends JpaRepository<Privilege,Integer> {

    //create query for get privilege object by given role id and module id
    @Query("select p from Privilege p where p.role_id.id=?1 and p.module_id.id=?2")
    Privilege getPrivByRoleModule(Integer roleid, Integer moduleid);
    //create query for get privilage by given username and module name ;
    @Query(value = "SELECT bit_or(p.sel) as sel, bit_or(p.ins) as inst, bit_or(p.upd) as upd,bit_or(p.del) as del FROM adwinscom.privilege as p where p.role_id in (select uhr.role_id from adwinscom.role_has_user as uhr where uhr.user_id in (select u.id from adwinscom.user as u where u.username=?1)) and p.module_id in (select m.id from adwinscom.module as m where m.name=?2);", nativeQuery = true)
    public String getPrivilageByUserModule(String username, String modulename);
}
