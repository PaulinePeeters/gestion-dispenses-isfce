package org.isfce.pid.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

/**
 * Service de gestion du stockage des fichiers uploadés.
 * Valide le type MIME et la taille avant enregistrement.
 *
 * @author Pauline Peeters
 */
@Service
public class StorageService {

    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf", "image/jpeg", "image/png");

    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;

    @Value("${storage.location:uploads}")
    private String storageLocation;
    private Path rootLocation;

    @PostConstruct
    public void init() {
        try {
            rootLocation = Paths.get(storageLocation).toAbsolutePath();
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize storage location", e);
        }
    }

    public String store(MultipartFile file) {
        if (file.isEmpty())
            throw new IllegalArgumentException("Cannot store empty file");

        if (file.getSize() > MAX_SIZE_BYTES)
            throw new IllegalArgumentException(
                    "Fichier trop volumineux. Maximum autorisé : 5 Mo.");

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType))
            throw new IllegalArgumentException(
                    "Type non autorisé. Seuls PDF, JPEG et PNG sont acceptés.");

        try {
            String originalName = file.getOriginalFilename();
            String safeName = (originalName != null)
                    ? originalName.replaceAll("[^a-zA-Z0-9._\\-]", "_")
                    : "fichier";

            String filename = UUID.randomUUID() + "_" + safeName; // Génère un nom de fichier unique
            Path destination = rootLocation.resolve(filename).normalize().toAbsolutePath();

            if (!destination.startsWith(rootLocation)) // Vérifie que le fichier est stocké dans le répertoire de
                                                       // stockage
                throw new SecurityException("Cannot store file outside storage directory");

            try (var in = file.getInputStream()) {
                Files.copy(in, destination);
            }
            return filename;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + file.getOriginalFilename(), e);
        }
    }
}