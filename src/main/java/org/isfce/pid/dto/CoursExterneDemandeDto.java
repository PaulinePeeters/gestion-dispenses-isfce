package org.isfce.pid.dto;

import org.isfce.pid.model.CoursExterneDemande;

/**
 * DTO pour exposer un cours externe rattaché à une demande de dispense.
 */
public record CoursExterneDemandeDto(
        Long id,
        String codeEtablissement,
        String codeCours,
        boolean connu,
        String intituleCours,
        Integer creditsEcts,
        String nomEtablissement) {

    public static CoursExterneDemandeDto from(CoursExterneDemande entity) {
        return new CoursExterneDemandeDto(
                entity.getId(),
                entity.getCodeEtablissement(),
                entity.getCodeCours(),
                entity.isConnu(),
                entity.getIntituleCours(),
                entity.getCreditsEcts(),
                entity.getNomEtablissement());
    }
}
