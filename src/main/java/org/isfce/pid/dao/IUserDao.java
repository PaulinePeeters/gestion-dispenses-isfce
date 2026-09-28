package org.isfce.pid.dao;

import java.util.List;

import org.isfce.pid.dto.UserDto;
import org.isfce.pid.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface IUserDao extends JpaRepository<User, String> {

	@Query("select new org.isfce.pid.dto.UserDto(u.username,u.email,u.nom,u.prenom) from TUSER u")
	List<UserDto> getAllUserDto();
}
