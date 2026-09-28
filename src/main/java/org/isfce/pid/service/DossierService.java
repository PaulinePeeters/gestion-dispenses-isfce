package org.isfce.pid.service;

import java.time.LocalDate;
import java.util.Optional;

import org.isfce.pid.controller.error.DossierException;
import org.isfce.pid.dao.IDossierDao;
import org.isfce.pid.model.Dossier;
import org.isfce.pid.model.EtatDossier;
import org.isfce.pid.model.NbDossiers;
import org.isfce.pid.model.User;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * Service pour la gestion des dossiers étudiants.
 *
 * @author Pauline Peeters
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DossierService {

	private final IDossierDao dossierDao;

	/**
	 * Crée un dossier si l'utilisateur n'en a pas déjà un en cours.
	 *
	 * @param user         L'utilisateur demandeur
	 * @param objetDemande Objet de la demande
	 * @return Le dossier créé
	 * @throws DossierException si un dossier est déjà en cours
	 */
	@Transactional
	public Dossier createDossier(User user, String objetDemande) throws DossierException {
		if (dossierDao.getNbDossierEnCours(user.getUsername()) > 0)
			throw new DossierException("err.dossier.enCours");

		Dossier dossierToSave = Dossier.builder()
				.date(LocalDate.now())
				.etat(EtatDossier.DEMANDE_EN_COURS)
				.user(user)
				.objetDemande(objetDemande)
				.build();

		@SuppressWarnings("null")
		Dossier savedDossier = dossierDao.save(dossierToSave);
		return savedDossier;
	}

	/**
	 * Récupère le dossier en cours de l'utilisateur.
	 *
	 * @param user L'utilisateur
	 * @return Optional contenant le dossier en cours, vide sinon
	 */
	public Optional<Dossier> getDossierEnCours(User user) {
		return dossierDao.findDossierEnCours(user);
	}

	/**
	 * Récupère le nombre de dossiers (en cours + clôturés) de l'utilisateur.
	 *
	 * @param userName Nom d'utilisateur
	 * @return NbDossiers avec les compteurs
	 */
	public NbDossiers getNbDossiers(String userName) {
		return new NbDossiers(
				dossierDao.getNbDossierCloture(userName),
				dossierDao.getNbDossierEnCours(userName));
	}
}
