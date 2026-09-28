package org.isfce.pid.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity(name = "TUSER")
@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User {
	@EqualsAndHashCode.Include
	@Id
	@Column(length = 50, nullable = false)
	private String username;
	@Column(length = 50, nullable = false)
	@Email
	private String email;
	@Column(length = 30, nullable = false)
	private String nom;
	@Column(length = 30)
	private String prenom;

}
