package org.isfce.pid.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import jakarta.persistence.JoinColumn;
import lombok.Setter;

/**
 * Entité représentant un acquis d'apprentissage pour un cours externe.
 * 
 * @author Pauline Peeters
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcquisExterne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "COURS_EXTERNE_ID", nullable = false)
    private CoursExterne coursExterne;

    @Column(length = 500, nullable = false)
    private String description;

    @Min(0)
    @Max(100)
    @Column(nullable = false)
    private Integer pourcentage;
}
