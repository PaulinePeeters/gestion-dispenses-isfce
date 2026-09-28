package org.isfce.pid.model;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import jakarta.persistence.JoinColumn;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.persistence.Column;
import lombok.Setter;

/**
 * Entité représentant une correspondance entre un cours externe
 * et une UE de l'ISFCE.
 *
 * @author Pauline Peeters
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Correspondance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "COURS_EXTERNE_ID", nullable = false)
    private CoursExterne coursExterne;

    @ManyToOne
    @JoinColumn(name = "UE_ISFCE_CODE", nullable = false)
    private UE ueIsfce;

    @DecimalMin("0.0")
    @DecimalMax("1.0")
    @Column(nullable = false)
    private BigDecimal coefficient;

    private boolean validee;
}
