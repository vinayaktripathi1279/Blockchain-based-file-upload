package com.portal.dto;

import java.time.LocalDateTime;

/**
 * DTO returned by POST /api/files/{id}/demo-verify
 * Used in the Tamper Detection Demo to demonstrate blockchain-backed file verification.
 */
public class TamperTestResponseDto {

    private boolean verified;
    private String fileId;
    private String fileName;
    private String originalBlockchainHash;
    private String testFileHash;
    private String message;
    private LocalDateTime testedAt;

    public TamperTestResponseDto() {
    }

    public TamperTestResponseDto(boolean verified, String fileId, String fileName,
                                 String originalBlockchainHash, String testFileHash,
                                 String message) {
        this.verified = verified;
        this.fileId = fileId;
        this.fileName = fileName;
        this.originalBlockchainHash = originalBlockchainHash;
        this.testFileHash = testFileHash;
        this.message = message;
        this.testedAt = LocalDateTime.now();
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

    public String getTestFileHash() {
        return testFileHash;
    }

    public void setTestFileHash(String testFileHash) {
        this.testFileHash = testFileHash;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTestedAt() {
        return testedAt;
    }

    public void setTestedAt(LocalDateTime testedAt) {
        this.testedAt = testedAt;
    }
}
