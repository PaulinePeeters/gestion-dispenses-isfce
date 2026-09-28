package org.isfce.pid.dto;

import org.isfce.pid.model.Etablissement;

import lombok.Data;

/**
 * DTO pour exposer les établissements.
 */
@Data
public class EtablissementDto {
    private String code;
    private String nom;
    private String siteWeb;

    public EtablissementDto(String code, String nom, String siteWeb) {
        this.code = code;
        this.nom = nom;
        this.siteWeb = siteWeb;
    }

    /**
     * Construit un DTO à partir d'une entité {@link Etablissement}.
     *
     * @param entity L'entité à convertir
     * @return Le DTO correspondant
     */
    public static EtablissementDto from(Etablissement entity) {
        return new EtablissementDto(
                entity.getCode(),
                entity.getNom(),
                entity.getSiteWeb());
    }
}
