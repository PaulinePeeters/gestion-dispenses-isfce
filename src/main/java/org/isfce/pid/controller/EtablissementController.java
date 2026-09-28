package org.isfce.pid.controller;

import java.util.List;

import org.isfce.pid.dto.EtablissementDto;
import org.isfce.pid.service.EtablissementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

/**
 * Contrôleur pour la liste des établissements externes.
 * 
 * @author Pauline Peeters
 */
@RestController
@RequestMapping("/api/etablissements")
@RequiredArgsConstructor
public class EtablissementController {

    private final EtablissementService etablissementService;

    /**
     * Retourne la liste de tous les établissements triés par nom.
     *
     * @return Liste des établissements
     */
    @GetMapping
    public ResponseEntity<List<EtablissementDto>> getAll() {
        return ResponseEntity.ok(etablissementService.getAllEtablissements());
    }
}
