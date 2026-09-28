package org.isfce.pid.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.isfce.pid.dao.CorrespondanceDao;
import org.isfce.pid.dto.SimulationRequestDto;
import org.isfce.pid.dto.SimulationResponseDto;
import org.isfce.pid.model.Correspondance;
import org.isfce.pid.model.CoursExterne;
import org.isfce.pid.model.UE;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

/**
 * Service gérant la détection des correspondances et des dispenses.
 * 
 * @author Pauline Peeters
 */
@Service
@RequiredArgsConstructor
public class CorrespondanceService {

    private final CorrespondanceDao correspondanceDao;

    /**
     * Calcule automatiquement si un étudiant a droit à des dispenses totales
     * (100%).
     *
     * @param coursReussis La liste des cours validés par l'étudiant dans une autre
     *                     école.
     * @return La liste des UEs de l'ISFCE dont l'étudiant est dispensé.
     */
    @Transactional(readOnly = true)
    public List<UE> detecterDispensesAutomatiques(List<CoursExterne> coursReussis) {
        if (coursReussis == null || coursReussis.isEmpty())
            return List.of();

        List<String> codes = coursReussis.stream()
                .map(CoursExterne::getCode)
                .toList();

        Map<UE, BigDecimal> totalParUE = new HashMap<>();

        correspondanceDao.findByCoursExterneCodeIn(codes).stream()
                .filter(Correspondance::isValidee)
                .forEach(c -> {
                    BigDecimal coeff = c.getCoefficient() != null ? c.getCoefficient() : BigDecimal.ZERO;
                    totalParUE.merge(c.getUeIsfce(), coeff, BigDecimal::add);
                });

        // On ne conserve que les UEs pour lesquelles la somme atteint 1.0 (soit 100%)
        return totalParUE.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ONE) >= 0)
                .map(Map.Entry::getKey)
                .toList();
    }

    /**
     * Simule le résultat d'une demande de dispense pour une UE.
     * 
     * @param request La requête contenant l'UE cible et la liste des cours externes
     *                proposés.
     * @return Un objet de réponse contenant le pourcentage calculé, un message
     *         explicatif et le statut d'acceptation.
     */
    @Transactional(readOnly = true)
    public SimulationResponseDto simulerPourUE(SimulationRequestDto request) {
        List<String> codesProposes = request.getCoursExternesProposes().stream()
                .map(SimulationRequestDto.CoursExterneSimulationDto::getCodeCours)
                .toList();

        List<Correspondance> correspondances = correspondanceDao.findByCoursExterneCodeIn(codesProposes);

        BigDecimal total = BigDecimal.ZERO;
        Set<String> traites = new HashSet<>();

        // Collecter tous les codes qui ont au moins une correspondance en DB
        Set<String> codesTrouves = correspondances.stream()
                .map(c -> c.getCoursExterne().getCode())
                .collect(java.util.stream.Collectors.toSet());

        for (Correspondance c : correspondances) {
            if (c.getUeIsfce().getCode().equals(request.getCodeUeCible())) {
                BigDecimal coeff = c.getCoefficient() != null ? c.getCoefficient() : BigDecimal.ZERO;
                total = total.add(coeff);
                traites.add(c.getCoursExterne().getCode());
            }
        }

        // Calculer la liste exacte des cours inconnus (aucune correspondance en DB)
        List<String> codesCoursInconnus = codesProposes.stream()
                .filter(code -> !codesTrouves.contains(code))
                .toList();

        boolean acceptee = total.compareTo(BigDecimal.ONE) >= 0;
        boolean inconnus = !codesCoursInconnus.isEmpty();
        BigDecimal moitie = new BigDecimal("0.5");

        String message;
        if (acceptee) {
            message = "Correspondance totale : crédits suffisants pour être dispensé.";
        } else if (total.compareTo(moitie) >= 0) {
            message = "Correspondance partielle : plus de la moitié de l'UE est couverte.";
        } else if (total.compareTo(BigDecimal.ZERO) > 0) {
            message = "Couverture insuffisante : moins de la moitié de l'UE est couverte (< 50%).";
        } else if (inconnus) {
            message = "Cours inconnus. Une analyse de votre situation sera nécessaire.";
        } else {
            message = "Aucune équivalence n'existe entre ces cours et cette UE.";
        }

        return SimulationResponseDto.builder()
                .dispenseAcceptee(acceptee)
                .pourcentageCouvert(total)
                .coursInconnus(inconnus)
                .codesCoursInconnus(codesCoursInconnus)
                .message(message)
                .build();
    }
}