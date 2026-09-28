package org.isfce.pid.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.isfce.pid.controller.error.DuplicateException;
import org.isfce.pid.dao.CorrespondanceDao;
import org.isfce.pid.dao.DemandeDispenseDao;
import org.isfce.pid.dao.SectionDao;
import org.isfce.pid.dao.UeDao;
import org.isfce.pid.dto.CreateDemandeRequestDto;
import org.isfce.pid.model.CoursExterneDemande;
import org.isfce.pid.model.DemandeDispense;
import org.isfce.pid.model.Document;
import org.isfce.pid.model.Dossier;
import org.isfce.pid.model.Section;
import org.isfce.pid.model.UE;
import org.isfce.pid.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

/**
 * Service pour la gestion des demandes de dispense.
 * Gère la création et la récupération des demandes de dispense liées aux
 * dossiers étudiants.
 * 
 * @author Pauline Peeters
 */
@Service
@RequiredArgsConstructor
public class DemandeDispenseService {

    private final DemandeDispenseDao demandeDao;
    private final DossierService dossierService;
    private final UserService userService;
    private final UeDao ueDao;
    private final SectionDao sectionDao;
    private final StorageService storageService;
    private final CorrespondanceDao correspondanceDao;

    @Transactional(readOnly = true)
    public List<DemandeDispense> getDemandesForStudent(String username) {
        return demandeDao.findByDossier_User_Username(username);
    }

    @Transactional
    public DemandeDispense createDemande(String username, String ueCode,
            String sectionCode, String motif, MultipartFile[] files,
            List<CreateDemandeRequestDto.CoursExterneInput> coursExternes) {

        User user = userService.getUserById(username)
                .orElseThrow(() -> new NoSuchElementException("Utilisateur introuvable : " + username));

        UE ue = ueDao.findById(ueCode)
                .orElseThrow(() -> new NoSuchElementException("UE introuvable : " + ueCode));

        Section section = sectionDao.findById(sectionCode)
                .orElseThrow(() -> new NoSuchElementException("Section introuvable : " + sectionCode));

        if (demandeDao.existsByDossier_User_UsernameAndUe_CodeAndStatutNot(username, ueCode,
                DemandeDispense.Statut.REFUSEE)) {
            throw new DuplicateException("ueCode", "Une demande de dispense est déjà en cours pour cette UE.");
        }

        Dossier dossier = dossierService.getDossierEnCours(user).orElse(null);
        if (dossier == null) {
            try {
                dossier = dossierService.createDossier(user, "Demande de dispenses");
            } catch (Exception e) {
                throw new RuntimeException("Impossible de créer le dossier", e);
            }
        }

        DemandeDispense demande = new DemandeDispense(dossier, ue, section, motif);

        addNewDocuments(demande, files);

        // Traiter les cours externes si fournis
        if (coursExternes != null && !coursExternes.isEmpty()) {
            addCoursExternes(demande, coursExternes);
        }

        return demandeDao.save(demande);
    }

    @Transactional(readOnly = true)
    public Optional<DemandeDispense> getDemandeByIdAndStudent(Long id, String username) {
        return demandeDao.findByIdAndStudentUsernameWithDocuments(id, username);
    }

    @Transactional
    public DemandeDispense addDocumentsToDemande(Long demandeId,
            String username, MultipartFile[] files) {

        DemandeDispense demande = demandeDao
                .findByIdAndStudentUsernameWithDocuments(demandeId, username)
                .orElseThrow(() -> new NoSuchElementException("Demande introuvable : " + demandeId));

        if (files != null && files.length > 0) {
            addNewDocuments(demande, files);
            return demandeDao.save(demande);
        }

        return demande;
    }

    private void addNewDocuments(DemandeDispense demande, MultipartFile[] files) {
        if (files == null) {
            return;
        }
        for (MultipartFile file : files) {
            String storedName = storageService.store(file);
            demande.getDossier().getDocuments().add(new Document(
                    file.getOriginalFilename(),
                    storedName,
                    file.getContentType(),
                    file.getSize(),
                    demande.getDossier()));
        }
    }

    /**
     * Calcule le statut connu/inconnu de chaque cours externe,
     * valide les champs complémentaires pour les inconnus,
     * et les rattache à la demande.
     */
    private void addCoursExternes(DemandeDispense demande,
            List<CreateDemandeRequestDto.CoursExterneInput> inputs) {

        // Collecter les codes de cours fournis
        List<String> codesToCheck = inputs.stream()
                .map(CreateDemandeRequestDto.CoursExterneInput::getCodeCours)
                .filter(c -> c != null && !c.isBlank())
                .toList();

        // Chercher tous les codes qui ont une correspondance en DB
        Set<String> codesConnus = codesToCheck.isEmpty() ? Set.of()
                : correspondanceDao.findByCoursExterneCodeIn(codesToCheck).stream()
                        .map(c -> c.getCoursExterne().getCode())
                        .collect(Collectors.toSet());

        boolean auMoinsUnInconnu = false;

        for (CreateDemandeRequestDto.CoursExterneInput input : inputs) {
            boolean connu = input.getCodeCours() != null
                    && !input.getCodeCours().isBlank()
                    && codesConnus.contains(input.getCodeCours());

            if (!connu) {
                auMoinsUnInconnu = true;
                // Valider les champs complémentaires obligatoires
                if (isBlank(input.getIntituleCours())) {
                    throw new IllegalArgumentException(
                            "L'intitulé du cours est obligatoire pour un cours inconnu.");
                }
                if (input.getCreditsEcts() == null || input.getCreditsEcts() <= 0) {
                    throw new IllegalArgumentException(
                            "Les crédits ECTS sont obligatoires pour un cours inconnu.");
                }
                if (isBlank(input.getNomEtablissement())) {
                    throw new IllegalArgumentException(
                            "Le nom de l'établissement est obligatoire pour un cours inconnu.");
                }
            }

            demande.getCoursExternes().add(new CoursExterneDemande(
                    demande,
                    input.getCodeEtablissement(),
                    input.getCodeCours(),
                    connu,
                    input.getIntituleCours(),
                    input.getCreditsEcts(),
                    input.getNomEtablissement()));
        }

        demande.setACoursInconnus(auMoinsUnInconnu);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
