package org.isfce.pid.dao;

import java.util.List;
import java.util.Optional;

import org.isfce.pid.model.DemandeDispense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repo pour l'entité DemandeDispense.
 * 
 * @author Pauline Peeters
 */
public interface DemandeDispenseDao extends JpaRepository<DemandeDispense, Long> {
        /**
         * Retourne les demandes de dispense d'un étudiant.
         * 
         * @param username Nom d'utilisateur de l'étudiant
         * @return Liste des demandes de dispense de l'étudiant
         */
        @Query("SELECT d FROM DemandeDispense d LEFT JOIN FETCH d.dossier dos LEFT JOIN FETCH dos.documents WHERE dos.user.username = :username")
        List<DemandeDispense> findByDossier_User_Username(@Param("username") String username);

        /**
         * Vérifie si une demande active (non-refusée) existe déjà pour un étudiant et
         * une UE.
         *
         * @param username Nom d'utilisateur de l'étudiant
         * @param ueCode   Code de l'UE
         * @param statut   Statut à exclure (REFUSEE)
         * @return true si une demande existe avec un statut différent de celui passé
         */
        boolean existsByDossier_User_UsernameAndUe_CodeAndStatutNot(String username, String ueCode,
                        DemandeDispense.Statut statut);

        /**
         * Retourne une demande de dispense par son id et le nom d'utilisateur de
         * l'étudiant.
         * 
         * @param id       Id de la demande de dispense
         * @param username Nom d'utilisateur de l'étudiant
         * @return Demande de dispense par son id et le nom d'utilisateur de l'étudiant
         */
        Optional<DemandeDispense> findByIdAndDossier_User_Username(Long id, String username);

        /**
         * Retourne une demande de dispense par son id et le nom d'utilisateur de
         * l'étudiant, en chargeant la liste de ses documents.
         * 
         * @param id       Id de la demande de dispense
         * @param username Nom d'utilisateur de l'étudiant
         * @return Demande de dispense avec ses documents.
         */
        @Query("SELECT d FROM DemandeDispense d LEFT JOIN FETCH d.dossier dos LEFT JOIN FETCH dos.documents WHERE d.id = :id AND dos.user.username = :username")
        Optional<DemandeDispense> findByIdAndStudentUsernameWithDocuments(@Param("id") Long id,
                        @Param("username") String username);
}
