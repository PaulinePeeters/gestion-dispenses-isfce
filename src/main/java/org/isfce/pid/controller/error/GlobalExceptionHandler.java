package org.isfce.pid.controller.error;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

/**
 * Gestionnaire global unique des exceptions REST.
 * Les détails internes sont loggués côté serveur uniquement.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 404 – ressource introuvable */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<String> handleNotFound(NoSuchElementException ex) {
        log.warn("Ressource introuvable: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ressource introuvable.");
    }

    /**
     * 409 – doublon : retourne un objet structuré { champ: message }
     * pour que le frontend puisse afficher l'erreur sur le bon champ.
     */
    @ExceptionHandler(DuplicateException.class)
    public ResponseEntity<Map<String, String>> handleDuplicate(DuplicateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(ex.getChamp(), ex.getMessage()));
    }

    /** 400 – problème métier sur un dossier */
    @ExceptionHandler(DossierException.class)
    public ResponseEntity<Map<String, String>> handleDossierException(DossierException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("objetDemande", ex.getMessage()));
    }

    /**
     * 400 – erreurs de validation Bean (@Valid) :
     * retourne un objet { nomChamp: messageErreur } pour chaque champ invalide.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage,
                        (existing, replacement) -> existing));
        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * 500 – erreur inattendue : loggée côté serveur, message générique au client.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception ex) {
        log.error("Erreur interne non gérée: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Une erreur interne s'est produite. Veuillez contacter l'administrateur.");
    }
}