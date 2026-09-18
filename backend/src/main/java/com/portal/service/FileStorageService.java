package com.portal.service;

import com.portal.exception.FileStorageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

/**
 * Service responsible for local filesystem storage of encrypted files.
 * Ensures original plaintext files are NEVER written to disk; only AES-256 ciphertexts.
 */
@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    private final Path encryptedStorageDir;

    public FileStorageService(@Value("${app.file.upload-dir:./uploads}") String uploadDir) {
        this.encryptedStorageDir = Paths.get(uploadDir, "encrypted").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.encryptedStorageDir);
            logger.info("Encrypted storage directory initialized at: {}", this.encryptedStorageDir);
        } catch (IOException e) {
            throw new FileStorageException("Could not create storage directory for encrypted files: " + uploadDir, e);
        }
    }

    /**
     * Saves encrypted byte data to disk under a unique file identifier.
     * @param fileId UUID string of the file record
     * @param encryptedBytes AES-256 ciphertext bytes
     * @return Absolute file path where the encrypted file was saved
     */
    public String saveEncryptedFile(String fileId, byte[] encryptedBytes) {
        try {
            Path targetPath = encryptedStorageDir.resolve(fileId + ".enc");
            Files.write(targetPath, encryptedBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            return targetPath.toString();
        } catch (IOException e) {
            throw new FileStorageException("Failed to save encrypted file to disk for id: " + fileId, e);
        }
    }

    /**
     * Reads the encrypted ciphertext bytes from disk.
     */
    public byte[] readEncryptedFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path)) {
                throw new FileStorageException("Encrypted file not found on disk at: " + filePath);
            }
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new FileStorageException("Error reading encrypted file from disk: " + filePath, e);
        }
    }

    /**
     * Validates an incoming MultipartFile.
     */
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }
        if (file.getOriginalFilename() == null || file.getOriginalFilename().trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid file name");
        }
        // Check 50MB upper limit
        if (file.getSize() > 50 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 50MB limit");
        }
    }
}
