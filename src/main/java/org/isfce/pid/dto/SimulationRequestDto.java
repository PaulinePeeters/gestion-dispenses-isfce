package org.isfce.pid.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO qui encapsule la requête de simulation d'une demande de dispense
 * par un étudiant pour une UE précise.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationRequestDto {
    private String codeUeCible;
    private List<CoursExterneSimulationDto> coursExternesProposes;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoursExterneSimulationDto {
        private String codeEtablissement;
        private String codeCours;
    }
}
