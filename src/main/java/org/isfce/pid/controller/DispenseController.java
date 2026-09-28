package org.isfce.pid.controller;

import org.isfce.pid.dto.SimulationRequestDto;
import org.isfce.pid.dto.SimulationResponseDto;
import org.isfce.pid.service.CorrespondanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Contrôleur gérant les endpoints de simulation de dispenses.
 *
 * @author Pauline Peeters
 */
@RestController
@RequestMapping("/api/dispenses")
@RequiredArgsConstructor
public class DispenseController {

    private final CorrespondanceService correspondanceService;

    /**
     * Simule une demande de dispense pour une UE spécifique
     * en fournissant les cours externes réussis.
     *
     * @param request la requête (UE ciblée + liste de cours réussis)
     * @return le bilan de simulation (accepté, partiel, inconnu)
     */
    @PostMapping("/simuler")
    public ResponseEntity<SimulationResponseDto> simulerDispense(@Valid @RequestBody SimulationRequestDto request) {
        return ResponseEntity.ok(correspondanceService.simulerPourUE(request));
    }
}