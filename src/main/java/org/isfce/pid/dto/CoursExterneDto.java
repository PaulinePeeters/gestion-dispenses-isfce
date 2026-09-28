package org.isfce.pid.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour un cours externe avec ses acquis.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoursExterneDto {
    private Long id;
    private String code;
    private String etablissementNom;
    private int credits;
    private List<AcquisExterneDto> acquis;
}
