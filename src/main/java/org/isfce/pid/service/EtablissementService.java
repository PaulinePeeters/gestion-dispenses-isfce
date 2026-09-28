package org.isfce.pid.service;

import java.util.List;

import org.isfce.pid.dao.EtablissementDao;

import org.isfce.pid.dto.EtablissementDto;
import org.isfce.pid.model.Etablissement;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/**
 * Service pour la gestion des établissements externes.
 */
@Service
@RequiredArgsConstructor
public class EtablissementService {

    private final EtablissementDao etablissementDao;

    /**
     * Retourne la liste de tous les établissements triés par nom.
     *
     * @return Liste des établissements
     */
    public List<EtablissementDto> getAllEtablissements() {
        List<Etablissement> etablissements = etablissementDao.findAllByOrderByNomAsc();
        return etablissements.stream()
                .map(EtablissementDto::from)
                .toList();
    }
}
