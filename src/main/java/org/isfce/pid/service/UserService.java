package org.isfce.pid.service;

import java.util.List;
import java.util.Optional;

import org.isfce.pid.dao.IUserDao;
import org.isfce.pid.dto.UserDto;
import org.isfce.pid.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

/**
 * Service pour la gestion des utilisateurs.
 *
 * @author Pauline Peeters
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

	private final IUserDao daoUser;

	/** Retourne tous les utilisateurs sous forme de DTO. */
	public List<UserDto> getAllUserDto() {
		return daoUser.getAllUserDto();
	}

	/** Retourne un utilisateur par son username. */
	public Optional<User> getUserById(String username) {
		return daoUser.findById(username);
	}

	/** Ajoute un utilisateur. */
	@Transactional
	public User addUser(User user) {
		return daoUser.save(user);
	}

	/** Retourne true si l'username existe en base. */
	public boolean existByUsername(String username) {
		return daoUser.existsById(username);
	}

	/** Crée ou met à jour un utilisateur. */
	@Transactional
	public User saveUser(User user) {
		return daoUser.save(user);
	}
}