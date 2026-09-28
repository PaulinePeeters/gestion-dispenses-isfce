package org.isfce.pid.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AccessLevel;

/**
 * Entité représentant un cours externe rattaché à une demande de dispense.
 * Permet de distinguer les cours connus (avec correspondance en DB) des cours
 * inconnus (saisis manuellement par l'étudiant).
 *
 * @author Pauline Peeters
 */
@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CoursExterneDemande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "demande_id", nullable = false)
    private DemandeDispense demande;

    /** Code de l'établissement. */
    @Column(length = 255)
    private String codeEtablissement;

    /** Code du cours externe. */
    @Column(length = 255)
    private String codeCours;

    /** true si le cours a une correspondance validée en DB. */
    @Column(nullable = false)
    private boolean connu;

    /** Intitulé libre du cours — obligatoire si inconnu. */
    private String intituleCours;

    /** Crédits ECTS — obligatoire si inconnu. */
    private Integer creditsEcts;

    /** Nom complet de l'établissement — obligatoire si inconnu. */
    private String nomEtablissement;

    public CoursExterneDemande(DemandeDispense demande, String codeEtablissement,
            String codeCours, boolean connu, String intituleCours,
            Integer creditsEcts, String nomEtablissement) {
        this.demande = demande;
        this.codeEtablissement = codeEtablissement;
        this.codeCours = codeCours;
        this.connu = connu;
        this.intituleCours = intituleCours;
        this.creditsEcts = creditsEcts;
        this.nomEtablissement = nomEtablissement;
    }
}
