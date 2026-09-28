package org.isfce.pid.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

/**
 * Représente un document joint à une demande de dispense.
 * Stocke les métadonnées des fichiers uploadés.
 *
 * @author Pauline Peeters
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String originalName;

    @Column(nullable = false)
    private String storedName;

    @Column(nullable = false) // type de fichier
    private String contentType;

    @Column(nullable = false)
    private Long size;

    @ManyToOne
    @JoinColumn(name = "dossier_id", nullable = false)
    private Dossier dossier;

    public Document(String originalName, String storedName,
            String contentType, Long size, Dossier dossier) {
        this.originalName = originalName;
        this.storedName = storedName;
        this.contentType = contentType;
        this.size = size;
        this.dossier = dossier;
    }
}