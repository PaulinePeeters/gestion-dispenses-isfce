package org.isfce.pid.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Entité représentant une demande de dispense soumise par un étudiant.
 * Une demande est liée à une UE, une section, et un dossier étudiant.
 *
 * @author Pauline Peeters
 */
@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DemandeDispense {

    public enum Statut {
        EN_ATTENTE, VALIDEE, REFUSEE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "UE_CODE", referencedColumnName = "code", nullable = false)
    private UE ue;

    @ManyToOne
    @JoinColumn(name = "SECTION_CODE", referencedColumnName = "code", nullable = false)
    private Section section;

    @Column(columnDefinition = "TEXT")
    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Statut statut;

    @ManyToOne
    @JoinColumn(name = "dossier_id", nullable = false)
    private Dossier dossier;

    @OneToMany(mappedBy = "demande", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CoursExterneDemande> coursExternes = new ArrayList<>();

    /** true si au moins un cours externe rattaché est inconnu (pas de correspondance en DB). */
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean aCoursInconnus;

    public DemandeDispense(Dossier dossier, UE ue, Section section, String motif) {
        this.dossier = dossier;
        this.ue = ue;
        this.section = section;
        this.motif = motif;
        this.statut = Statut.EN_ATTENTE;
    }
}