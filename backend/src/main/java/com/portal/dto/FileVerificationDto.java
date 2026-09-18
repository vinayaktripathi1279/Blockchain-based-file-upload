package com.portal.dto;

import java.time.LocalDateTime;

/**
 * DTO returned by GET /api/files/{id}/verify
 * Encapsulates the results of decrypting stored ciphertext, hashing on the fly,
 * and comparing with the immutable blockchain hash.
 */
public class FileVerificationDto {

    private boolean verified;
    private String fileId;
    private String fileName;
    private String originalBlockchainHash;
    private String currentDecryptedHash;
    private String blockchainTxHash;
    private String message;
    private LocalDateTime verifiedAt;

    public FileVerificationDto() {
    }

    public FileVerificationDto(boolean verified, String fileId, String fileName,
                               String originalBlockchainHash, String currentDecryptedHash,
                               String blockchainTxHash, String message) {
        this.verified = verified;
        this.fileId = fileId;
        this.fileName = fileName;
        this.originalBlockchainHash = originalBlockchainHash;
        this.currentDecryptedHash = currentDecryptedHash;
        this.blockchainTxHash = blockchainTxHash;
        this.message = message;
        this.verifiedAt = LocalDateTime.now();
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getFileId() {
        return fileId;
    }

    public void setFileId(String fileId) {
        this.fileId = fileId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getOriginalBlockchainHash() {
        return originalBlockchainHash;
    }

    public void setOriginalBlockchainHash(String originalBlockchainHash) {
        this.originalBlockchainHash = originalBlockchainHash;
    }

    public String getCurrentDecryptedHash() {
        return currentDecryptedHash;
    }

    public void setCurrentDecryptedHash(String currentDecryptedHash) {
        this.currentDecryptedHash = currentDecryptedHash;
    }

    public String getBlockchainTxHash() {
        return blockchainTxHash;
    }

    public void setBlockchainTxHash(String blockchainTxHash) {
        this.blockchainTxHash = blockchainTxHash;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
