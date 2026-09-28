package org.isfce.pid.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO représentant un acquis d'apprentissage externe.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AcquisExterneDto {
    private Long id;

    @NotBlank
    private String description;

    @Min(1)
    @Max(100)
    private Integer pourcentage;
}
