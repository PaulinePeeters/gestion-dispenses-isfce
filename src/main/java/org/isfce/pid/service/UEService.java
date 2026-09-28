package org.isfce.pid.service;

import java.util.List;
import java.util.Optional;

import org.isfce.pid.dao.SectionDao;
import org.isfce.pid.dao.UeDao;
import org.isfce.pid.dto.UEFullDto;
import org.isfce.pid.dto.SectionDto;
import org.isfce.pid.dto.UEDto;
import org.isfce.pid.mapper.UEMapper;
import org.isfce.pid.model.UE;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Service pour la gestion des UE et des sections.
 * Fournit les opérations CRUD et les requêtes de consultation.
 */
@Service
@RequiredArgsConstructor
public class UEService {

	private final UeDao daoUE;

	private final SectionDao daoSection;

	private final UEMapper mapper;

	/**
	 * Récupère toutes les UEs.
	 * 
	 * @return Liste de toutes les UEs
	 */
	public List<UE> getListe() {
		return daoUE.findAll();
	}

	/**
	 * Récupère une UE complète par son code.
	 * 
	 * @param id Code de l'UE
	 * @return UE complète avec ses acquis, ou Optional vide si non trouvée
	 */
	public Optional<UEFullDto> getUE(String id) {
		return daoUE.findById(java.util.Objects.requireNonNull(id)).map(mapper::toUEFullDto);
	}

	/**
	 * Sauvegarde une nouvelle UE à partir d'un FullDTO.
	 * 
	 * @param ueAcquisDto DTO complet de l'UE
	 * @return UE sauvegardée
	 */
	public UEFullDto addUE(@Valid UEFullDto ueAcquisDto) {
		UE ue = java.util.Objects.requireNonNull(mapper.fromUEFullDto(java.util.Objects.requireNonNull(ueAcquisDto)));
		return mapper.toUEFullDto(daoUE.save(ue));
	}

	/**
	 * Vérifie si une UE existe.
	 * 
	 * @param code Code de l'UE
	 * @return true si l'UE existe, false sinon
	 */
	public boolean existUE(String code) {
		return daoUE.existsById(java.util.Objects.requireNonNull(code));
	}

	/**
	 * Supprime une UE.
	 * 
	 * @param code Code de l'UE à supprimer
	 */
	public void deleteUE(String code) {
		daoUE.deleteById(java.util.Objects.requireNonNull(code));
	}

	/**
	 * Retourne la liste des UE sans les acquis (via un DTO).
	 * 
	 * @return Liste des UEs simplifiées
	 */
	public List<UEDto> getListeUE() {
		return daoUE.findAllUE_Dto();
	}

	/**
	 * Retourne la liste des UE d'une section donnée, sans les acquis.
	 * 
	 * @param section Code de la section
	 * @return Liste des UEs filtrées par section
	 */
	public List<UEDto> getListeUEBySection(String section) {
		return daoUE.findAllUEBySection_Dto(section);
	}

	/**
	 * Récupère la liste de toutes les sections.
	 * 
	 * @return Liste des sections (avec cache)
	 */
	@Cacheable
	public List<SectionDto> getListeSections() {
		return daoSection.findAllSection_Dto();
	}

}
