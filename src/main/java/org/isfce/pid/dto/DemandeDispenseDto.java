package org.isfce.pid.dto;

import java.util.List;

import org.isfce.pid.model.DemandeDispense;

/**
 * DTO pour exposer les demandes de dispense
 */
public record DemandeDispenseDto(
                Long id,
                String ueCode,
                String sectionCode,
                String motif,
                String statut,
                boolean aCoursInconnus,
                List<DocumentDto> documents,
                List<CoursExterneDemandeDto> coursExternes) {
        /**
         * Construit un DTO à partir d'une entité.
         *
         * @param entity L'entité à convertir
         * @return Le DTO correspondant
         */
        public static DemandeDispenseDto from(DemandeDispense entity) {
                List<DocumentDto> docs = entity.getDossier().getDocuments().stream()
                                .map(d -> new DocumentDto(d.getId(), d.getOriginalName(), d.getContentType(),
                                                d.getSize()))
                                .toList();
                List<CoursExterneDemandeDto> cours = entity.getCoursExternes().stream()
                                .map(CoursExterneDemandeDto::from)
                                .toList();
                return new DemandeDispenseDto(
                                entity.getId(),
                                entity.getUe().getCode(),
                                entity.getSection().getCode(),
                                entity.getMotif(),
                                entity.getStatut().name(),
                                entity.isACoursInconnus(),
                                docs,
                                cours);
        }
}
