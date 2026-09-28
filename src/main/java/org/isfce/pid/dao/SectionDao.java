package org.isfce.pid.dao;

import java.util.List;

import org.isfce.pid.dto.SectionDto;
import org.isfce.pid.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SectionDao extends JpaRepository<Section, String> {
	@Query("SELECT new org.isfce.pid.dto.SectionDto(s.code,  s.nom) FROM TSECTION s")
    List<SectionDto> findAllSection_Dto();

}
