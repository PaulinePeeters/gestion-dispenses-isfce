package org.isfce.pid.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;

/**
 * Entité représentant un cours suivi dans un établissement externe.
 *
 * @author Pauline Peeters
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoursExterne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String code;

    @ManyToOne
    @JoinColumn(name = "ETABLISSEMENT_CODE", nullable = false)
    private Etablissement etablissement;

    @Column(nullable = false)
    private int credits;

    @OneToMany(mappedBy = "coursExterne", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AcquisExterne> acquis = new ArrayList<>();
}
