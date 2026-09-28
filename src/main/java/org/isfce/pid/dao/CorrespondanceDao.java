package org.isfce.pid.dao;

import java.util.List;

import org.isfce.pid.model.Correspondance;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repo pour l'entité Correspondance.
 * 
 * @author Pauline Peeters
 */

public interface CorrespondanceDao extends JpaRepository<Correspondance, Long> {
    List<Correspondance> findByCoursExterneCodeIn(List<String> codes);
}
