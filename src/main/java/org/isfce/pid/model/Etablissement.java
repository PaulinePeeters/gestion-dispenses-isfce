package org.isfce.pid.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entité représentant un établissement externe.
 * 
 * @author Pauline Peeters
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Etablissement {
    @Id
    private String code;
    private String nom;
    private String siteWeb;
}
