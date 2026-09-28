package org.isfce.pid.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO pour la requête de création d'une demande de dispense.
 * Contient les infos de base + la liste optionnelle de cours externes.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateDemandeRequestDto {
    private String ueCode;
    private String sectionCode;
    private String motif;
    private List<CoursExterneInput> coursExternes;

    /**
     * Cours externe soumis par l'étudiant.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoursExterneInput {
        private String codeEtablissement;
        private String codeCours;
        private String intituleCours;
        private Integer creditsEcts;
        private String nomEtablissement;
    }
}
