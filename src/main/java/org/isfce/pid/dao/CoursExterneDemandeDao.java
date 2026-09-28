package org.isfce.pid.dao;

import org.isfce.pid.model.CoursExterneDemande;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repo pour l'entité CoursExterneDemande.
 *
 * @author Pauline Peeters
 */
public interface CoursExterneDemandeDao extends JpaRepository<CoursExterneDemande, Long> {
}
