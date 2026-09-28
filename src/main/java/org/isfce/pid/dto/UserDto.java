package org.isfce.pid.dto;

/**
 * DTO représentant les informations d'un utilisateur.
 * 
 * @param username Nom d'utilisateur unique
 * @param email    Adresse email
 * @param nom      Nom de famille
 * @param prenom   Prénom
 */
public record UserDto(String username, String email, String nom, String prenom) {

}
