package com.portal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * FileTransfer Entity representing an encrypted file transfer record.
 * Contains cryptographic metadata, file specs, sender/recipient relations,
 * and the blockchain transaction hash where the file's SHA-256 fingerprint is committed.
 */
@Entity
@Table(name = "file_transfers")
public class FileTransfer {

    @Id
    @Column(length = 64, nullable = false, updatable = false)
    private String id; // UUID string, used as the on-chain fileId

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(name = "file_hash", nullable = false, length = 64)
    private String fileHash; // Original plaintext file's SHA-256 hash (hex string)

    @Column(name = "file_path", nullable = false)
    private String filePath; // Path to the AES-256 encrypted file on disk

    @Column(name = "blockchain_tx_hash", length = 128)
    private String blockchainTxHash; // Transaction hash on the blockchain

    @Column(nullable = false, length = 32)
    private String status; // "STORED", "VERIFIED", "FLAGGED"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public FileTransfer() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "STORED";
        }
    }

    // Convenience helpers
    public Long getSenderId() {
        return sender != null ? sender.getId() : null;
    }

    public Long getRecipientId() {
        return recipient != null ? recipient.getId() : null;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public User getRecipient() {
        return recipient;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public String getFileHash() {
        return fileHash;
    }

    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getBlockchainTxHash() {
        return blockchainTxHash;
    }

    public void setBlockchainTxHash(String blockchainTxHash) {
        this.blockchainTxHash = blockchainTxHash;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
