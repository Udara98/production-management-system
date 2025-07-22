package com.AdwinsCom.AdwinsCom.Repository;

import com.AdwinsCom.AdwinsCom.entity.Production.Flavour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FlavourRepository extends JpaRepository<Flavour,String> {
    @Query("SELECT f FROM Flavour f WHERE f.id = :id")
    Flavour cusFindFlavourById(@Param("id") String id);
}
