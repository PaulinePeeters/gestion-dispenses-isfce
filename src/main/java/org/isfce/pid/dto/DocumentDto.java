package org.isfce.pid.dto;

/**
 * DTO pour exposer les métadonnées d'un document joint à une demande de
 * dispense.
 */
public record DocumentDto(
                Long id,
                String originalName,
                String contentType,
                Long size) {
}
