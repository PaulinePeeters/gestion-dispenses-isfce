package org.isfce.pid.dto;

import java.time.LocalDate;

import org.isfce.pid.model.EtatDossier;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO représentant un dossier de demande de dispenses.
 * 
 * @param id           Identifiant unique du dossier
 * @param date         Date de création du dossier
 * @param etat         État actuel du dossier
 * @param objetDemande Objet de la demande
 * @param user         Utilisateur propriétaire du dossier
 */
public record DossierDto(Long id, LocalDate date, EtatDossier etat, @NotBlank String objetDemande, UserDto user) {

}
