package org.isfce.pid.dao;

import java.util.List;

import org.isfce.pid.dto.UEDto;
import org.isfce.pid.model.UE;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UeDao extends JpaRepository<UE,String>
{
	@Query("SELECT new org.isfce.pid.dto.UEDto(u.code, u.ref, u.nom, u.nbPeriodes, u.ects, u.prgm) FROM TUE u")
    List<UEDto> findAllUE_Dto();
	
	@Query("SELECT new org.isfce.pid.dto.UEDto(u.code, u.ref, u.nom, u.nbPeriodes, u.ects, u.prgm) FROM TSECTION s join s.listeUE u where s.code = ?1 ")
    List<UEDto> findAllUEBySection_Dto(String section);
}
