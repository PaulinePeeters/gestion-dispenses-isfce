package org.isfce.pid.dao;

import org.isfce.pid.model.Etablissement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repo pour l'entité Etablissement.
 * 
 * @author Pauline Peeters
 */
public interface EtablissementDao extends JpaRepository<Etablissement, String> {

    /**
     * Retourne tous les établissements triés par nom
     * 
     * @return Liste triée des établissements
     */
    List<Etablissement> findAllByOrderByNomAsc();
}
