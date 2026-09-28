package org.isfce.pid.controller;

import java.util.List;

import org.isfce.pid.dto.UserDto;
import org.isfce.pid.model.User;
import org.isfce.pid.service.UserService;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Contrôleur pour les utilisateurs
 */

@RestController
@RequestMapping(path = "/api/user", produces = "application/json")
@Slf4j
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@PreAuthorize(value = "hasAnyRole('ETUDIANT','ADMIN')")
	@GetMapping(params = "all")
	public ResponseEntity<List<UserDto>> getAllUser() {
		return ResponseEntity.ok(userService.getAllUserDto());
	}

	@GetMapping("/profile/{id}")
	@PreAuthorize(value = "hasRole('ADMIN') or #user == authentication.name")
	public ResponseEntity<UserDto> getUserInfo(@PathVariable("id") @Param("user") String username,
			JwtAuthenticationToken auth) {
		var oUser = userService.getUserById(username);
		log.info(auth.getName() + "  username: " + username);
		User user = oUser.orElse(null);

		// Crée l'utilisateur s'il n'existe pas et que
		// l'utilisateur connecté correspond au username
		if (oUser.isEmpty() && auth.getName().equals(username)) {
			// crée un utilisateur
			var token = auth.getToken();
			String email = token.getClaimAsString("email");
			String nom = token.getClaimAsString("family_name");
			String prenom = token.getClaimAsString("given_name");
			user = userService.addUser(new User(username, email, nom, prenom));
		}
		if (user != null)
			return ResponseEntity.ok(new UserDto(username, user.getEmail(), user.getNom(), user.getPrenom()));
		return ResponseEntity.notFound().build();
	}

}
