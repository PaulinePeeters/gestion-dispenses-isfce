package org.isfce.pid.mapper;

import java.util.List;

import org.isfce.pid.dto.CoursExterneDto;
import org.isfce.pid.model.CoursExterne;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper pour l'entité CoursExterne.
 *
 * @author Pauline Peeters
 */
@Mapper(componentModel = "spring")
public interface CoursExterneMapper {

    @Mapping(source = "etablissement.nom", target = "etablissementNom")
    CoursExterneDto toDto(CoursExterne coursExterne);

    List<CoursExterneDto> toDtoList(List<CoursExterne> list);
}
