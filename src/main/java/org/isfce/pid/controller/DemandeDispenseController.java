package org.isfce.pid.controller;

import java.security.Principal;
import java.util.List;

import org.isfce.pid.dto.CreateDemandeRequestDto;
import org.isfce.pid.dto.DemandeDispenseDto;
import org.isfce.pid.model.DemandeDispense;
import org.isfce.pid.service.DemandeDispenseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

/**
 * Contrôleur pour les demandes de dispense.
 * 
 * @author Pauline Peeters
 */
@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ETUDIANT')")
public class DemandeDispenseController {

    private final DemandeDispenseService demandeService;
    private final ObjectMapper objectMapper;

    /** Récupère toutes les demandes de l'étudiant connecté. */
    @GetMapping
    public ResponseEntity<List<DemandeDispenseDto>> getMyRequests(Principal principal) {
        List<DemandeDispenseDto> dtos = demandeService.getDemandesForStudent(principal.getName())
                .stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    /** Crée une nouvelle demande de dispense. */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<DemandeDispenseDto> createRequest(
            @RequestParam("ueCode") @NotBlank String ueCode,
            @RequestParam("sectionCode") @NotBlank String sectionCode,
            @RequestParam("motif") String motif,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "coursExternes", required = false) String coursExternesJson,
            Principal principal) {

        List<CreateDemandeRequestDto.CoursExterneInput> coursExternes = null;
        if (coursExternesJson != null && !coursExternesJson.isBlank()) {
            try {
                coursExternes = objectMapper.readValue(coursExternesJson,
                        new TypeReference<List<CreateDemandeRequestDto.CoursExterneInput>>() {
                        });
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        }

        DemandeDispenseDto created = toDto(
                demandeService.createDemande(principal.getName(), ueCode, sectionCode, motif, files, coursExternes));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** Récupère une demande par son ID pour l'étudiant connecté. */
    @GetMapping("/{id}")
    public ResponseEntity<DemandeDispenseDto> getRequestById(
            @PathVariable("id") Long id,
            Principal principal) {
        return demandeService.getDemandeByIdAndStudent(id, principal.getName())
                .map(d -> ResponseEntity.ok(toDto(d)))
                .orElse(ResponseEntity.notFound().build());
    }

    /** Ajoute des documents complémentaires à une demande existante. */
    @PostMapping(value = "/{id}/documents", consumes = "multipart/form-data")
    public ResponseEntity<DemandeDispenseDto> addDocumentsToRequest(
            @PathVariable("id") Long id,
            @RequestParam("files") MultipartFile[] files,
            Principal principal) {
        DemandeDispenseDto updated = toDto(
                demandeService.addDocumentsToDemande(id, principal.getName(), files));
        return ResponseEntity.ok(updated);
    }

    private DemandeDispenseDto toDto(DemandeDispense demande) {
        return DemandeDispenseDto.from(demande);
    }
}