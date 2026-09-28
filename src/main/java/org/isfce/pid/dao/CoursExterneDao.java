package org.isfce.pid.dao;

import java.util.List;
import java.util.Optional;
import org.isfce.pid.model.CoursExterne;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repo pour l'entité CoursExterne.
 * 
 * @author Pauline Peeters
 */
public interface CoursExterneDao extends JpaRepository<CoursExterne, Long> {
    Optional<CoursExterne> findByCodeAndEtablissementCode(String code, String etablissementCode);

    @EntityGraph(attributePaths = { "acquis", "etablissement" })
    List<CoursExterne> findByEtablissementCode(String etablissementCode);
}
