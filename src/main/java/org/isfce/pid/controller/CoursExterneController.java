package org.isfce.pid.controller;

import java.util.List;

import org.isfce.pid.dao.CoursExterneDao;
import org.isfce.pid.dto.CoursExterneDto;
import org.isfce.pid.mapper.CoursExterneMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

/**
 * Contrôleur pour les cours externes.
 * 
 * @author Pauline Peeters
 */
@RestController
@RequestMapping("/api/cours-externes")
@RequiredArgsConstructor
public class CoursExterneController {

    private final CoursExterneDao coursExterneDao;
    private final CoursExterneMapper coursExterneMapper;

    /**
     * Retourne la liste des cours pour un établissement donné.
     * 
     * @param code Code de l'établissement
     * @return Liste des cours
     */
    @GetMapping("/etablissement/{code}")
    public ResponseEntity<List<CoursExterneDto>> getByEtablissement(@PathVariable("code") String code) {
        return ResponseEntity.ok(
                coursExterneMapper.toDtoList(coursExterneDao.findByEtablissementCode(code)));
    }
}
