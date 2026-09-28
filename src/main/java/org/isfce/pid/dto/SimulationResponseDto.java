package org.isfce.pid.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO qui renvoie le statut calculé après une simulation de dispense pour une
 * UE.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationResponseDto {
    private boolean dispenseAcceptee;
    private BigDecimal pourcentageCouvert;
    private boolean coursInconnus;
    private String message;

    /** Liste des codes de cours proposés qui n'ont aucune correspondance en DB. */
    @Builder.Default
    private List<String> codesCoursInconnus = List.of();
}
