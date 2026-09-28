package org.isfce.pid.controller;

import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;

import org.isfce.pid.controller.error.DuplicateException;
import org.isfce.pid.dto.UEFullDto;
import org.isfce.pid.dto.SectionDto;
import org.isfce.pid.dto.UEDto;
import org.isfce.pid.service.UEService;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Contrôleur REST pour la gestion des Unités d'Enseignement (UE) et des
 * sections.
 * Fournit les endpoints pour consulter, créer, modifier et supprimer des UEs.
 */
@RestController
@RequestMapping(path = "/api/ue/", produces = "application/json")
@Slf4j
@RequiredArgsConstructor
public class UEController {

	private final UEService ueService;
	private final MessageSource bundle;

	/** Récupère la liste de toutes les sections disponibles. */
	@GetMapping("sections")
	ResponseEntity<List<SectionDto>> getListeSection() {
		return ResponseEntity.ok(ueService.getListeSections());
	}

	/**
	 * Récupère la liste des UEs, filtrées par section si spécifié.
	 *
	 * @param section Code de la section (ou "all" pour toutes)
	 */
	@GetMapping("liste")
	ResponseEntity<List<UEDto>> getListe(
			@RequestParam(name = "section", required = false, defaultValue = "all") String section) {
		List<UEDto> result = "all".equals(section)
				? ueService.getListeUE()
				: ueService.getListeUEBySection(section);
		return ResponseEntity.ok(result);
	}

	/**
	 * Récupère les détails complets d'une UE par son code.
	 *
	 * @throws NoSuchElementException si l'UE n'existe pas
	 */
	@GetMapping("/detail/{code}")
	ResponseEntity<UEFullDto> getUE(@PathVariable("code") String code, Locale locale) {
		return ResponseEntity.ok(
				ueService.getUE(code).orElseThrow(() -> new NoSuchElementException(
						bundle.getMessage("err.notFound", new String[] { code }, locale))));
	}

	/**
	 * Crée une nouvelle UE.
	 *
	 * @throws DuplicateException si une UE avec le même code existe déjà
	 */
	@PostMapping(path = "add", consumes = "application/json")
	ResponseEntity<UEFullDto> addUEPost(@Valid @RequestBody UEFullDto ue, Locale locale) {
		if (ueService.existUE(ue.getCode()))
			throw new DuplicateException(
					bundle.getMessage("err.doublon", new String[] { "UE" }, locale), ue.getCode());

		ue = ueService.addUE(ue);
		log.debug("Ajout d'une UE: {}", ue);
		return ResponseEntity.status(HttpStatus.CREATED).body(ue);
	}

	/**
	 * Supprime une UE par son code.
	 * 
	 * @throws NoSuchElementException si l'UE n'existe pas
	 */
	@DeleteMapping("{code}/delete")
	ResponseEntity<Void> deleteUE(@PathVariable("code") String code) {
		ueService.deleteUE(code);
		return ResponseEntity.noContent().build();
	}
}
