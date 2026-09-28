package org.isfce.pid.controller;

import java.util.Locale;
import java.util.NoSuchElementException;

import org.isfce.pid.controller.error.DossierException;
import org.isfce.pid.dto.DossierDto;
import org.isfce.pid.mapper.UEMapper;
import org.isfce.pid.model.Dossier;
import org.isfce.pid.model.NbDossiers;
import org.isfce.pid.model.User;
import org.isfce.pid.service.DossierService;
import org.isfce.pid.service.UserService;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api/dossier/", produces = "application/json")
public class DossierController {

    private final DossierService dossierService;
    private final UserService userService;
    private final MessageSource bundle;
    private final UEMapper mapper;

    /**
     * Crée un dossier pour un user existant et s'il n'a pas encore de dossier en
     * cours
     * 
     * @param dossier
     * @param locale
     * @param auth
     * @return Dossier avec son id
     * @throws DossierException
     * @throws NoSuchMessageException
     */

    @PreAuthorize("hasRole('ETUDIANT')")
    @PostMapping(path = "add", consumes = "application/json")
    public ResponseEntity<DossierDto> nouveauDossier(
            @Valid @RequestBody ObjetDemande objetDemande,
            Locale locale,
            Authentication auth) throws NoSuchMessageException, DossierException {

        String etu = auth.getName();
        User user = userService.getUserById(etu).orElseThrow(
                () -> new NoSuchElementException(bundle.getMessage("err.notFound", new String[] { etu }, locale)));

        try {
            Dossier dossier = dossierService.createDossier(user, objetDemande.objetDemande());
            return ResponseEntity.ok(mapper.toDossierDto(dossier));
        } catch (DossierException e) {
            throw new DossierException(bundle.getMessage(e.getMessage(), new String[] {}, locale));
        }
    }

    /**
     * Récupère le nombre de dossiers de l'utilisateur connecté.
     */
    @PreAuthorize("hasRole('ETUDIANT')")
    @GetMapping("nb")
    public ResponseEntity<NbDossiers> getNbDossiers(Authentication auth) {
        return ResponseEntity.ok(dossierService.getNbDossiers(auth.getName()));
    }

    /**
     * Récupère le dossier courant de l'utilisateur connecté.
     */
    @PreAuthorize("hasRole('ETUDIANT')")
    @GetMapping("current")
    public ResponseEntity<DossierDto> getDossierCourant(Authentication auth) {
        return userService.getUserById(auth.getName())
                .flatMap(dossierService::getDossierEnCours)
                .map(dossier -> ResponseEntity.ok(mapper.toDossierDto(dossier)))
                .orElse(ResponseEntity.noContent().build());
    }

    record ObjetDemande(@NotBlank String objetDemande) {
    }
}