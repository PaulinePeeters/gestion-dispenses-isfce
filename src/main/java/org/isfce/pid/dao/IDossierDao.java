package org.isfce.pid.dao;

import java.util.List;
import java.util.Optional;

import org.isfce.pid.model.Dossier;
import org.isfce.pid.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IDossierDao extends JpaRepository<Dossier, Long> {
	List<Dossier> findDossierByUserOrderByDateDesc(User user);

	@Query("from TDOSSIER d where d.user=:user and d.etat<>EtatDossier.CLOTURE")
	Optional<Dossier> findDossierEnCours(@Param("user") User user);

	@NativeQuery("""
			select count(*) from TDOSSIER d where d.FKUSER=:username and d.etat<>'CLOTURE'
						""")
	int getNbDossierEnCours(@Param("username") String userName);

	@NativeQuery("""
			select count(*) from TDOSSIER d where d.FKUSER=:username and d.etat='CLOTURE'
						""")
	int getNbDossierCloture(@Param("username") String userName);

	int countByUser(User user);

}
