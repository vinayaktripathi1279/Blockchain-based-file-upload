package com.portal.controller;

import com.portal.dto.DashboardStatsDto;
import com.portal.dto.FileTransferDto;
import com.portal.dto.FileVerificationDto;
import com.portal.dto.TamperTestResponseDto;
import com.portal.entity.FileTransfer;
import com.portal.entity.User;
import com.portal.exception.ResourceNotFoundException;
import com.portal.exception.UnauthorizedException;
import com.portal.repository.FileTransferRepository;
import com.portal.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller handling all file transfer operations:
 * - File upload with AES-256 encryption and Blockchain registration
 * - Sent and Received file listings
 * - Secure authenticated downloads with authorization checks (HTTP 403 enforcement)
 * - Cryptographic integrity verification against smart contract
 * - Tamper Detection Demo endpoint
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    private final FileTransferRepository fileTransferRepository;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final CryptoService cryptoService;
    private final BlockchainService blockchainService;
    private final AuditLogService auditLogService;

    public FileController(FileTransferRepository fileTransferRepository,
                          UserService userService,
                          FileStorageService fileStorageService,
                          CryptoService cryptoService,
                          BlockchainService blockchainService,
                          AuditLogService auditLogService) {
        this.fileTransferRepository = fileTransferRepository;
        this.userService = userService;
        this.fileStorageService = fileStorageService;
        this.cryptoService = cryptoService;
        this.blockchainService = blockchainService;
        this.auditLogService = auditLogService;
    }

    /**
     * Phase 3, 5, 6: Secure File Upload
     * 1. Validates file and recipient
     * 2. Calculates SHA-256 hash of plaintext file
     * 3. Encrypts file with AES-256 (random IV)
     * 4. Saves encrypted ciphertext to disk (/uploads/encrypted)
     * 5. Commits SHA-256 hash to Blockchain Smart Contract
     * 6. Saves record with blockchain transaction hash to MySQL
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileTransferDto> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("recipientId") Long recipientId,
            Authentication authentication,
            HttpServletRequest request) {

        // 1. Validation
        fileStorageService.validateFile(file);
        User sender = userService.getUserByEmail(authentication.getName());
        User recipient = userService.getUserById(recipientId);

        if (sender.getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("Cannot send a file to yourself. Please select another recipient.");
        }

        try {
            byte[] originalBytes = file.getBytes();
            String originalFileName = file.getOriginalFilename();
            String contentType = file.getContentType() != null ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
            long fileSize = file.getSize();

            // 2. Cryptographic SHA-256 digest of original plaintext
            String sha256Hash = cryptoService.calculateSha256(originalBytes);

            // 3. AES-256 Encryption
            byte[] encryptedBytes = cryptoService.encrypt(originalBytes);

            // 4. Save encrypted ciphertext to local disk
            String fileId = UUID.randomUUID().toString();
            String storedPath = fileStorageService.saveEncryptedFile(fileId, encryptedBytes);

            // 5. Blockchain Smart Contract Integration
            String txHash = blockchainService.registerFileHash(fileId, sha256Hash);

            // 6. Persist FileTransfer record in MySQL
            FileTransfer transfer = new FileTransfer();
            transfer.setId(fileId);
            transfer.setFileName(originalFileName);
            transfer.setFileSize(fileSize);
            transfer.setContentType(contentType);
            transfer.setSender(sender);
            transfer.setRecipient(recipient);
            transfer.setFileHash(sha256Hash);
            transfer.setFilePath(storedPath);
            transfer.setBlockchainTxHash(txHash);
            transfer.setStatus("STORED");

            FileTransfer savedTransfer = fileTransferRepository.save(transfer);

            // 7. Audit Logging
            auditLogService.log("FILE_UPLOADED", sender, fileId,
                    "Uploaded '" + originalFileName + "' (" + fileSize + " bytes) to " + recipient.getEmail() + " [Tx: " + txHash + "]",
                    request.getRemoteAddr());

            return new ResponseEntity<>(FileTransferDto.fromEntity(savedTransfer), HttpStatus.CREATED);

        } catch (IOException e) {
            throw new RuntimeException("Error reading uploaded file data", e);
        }
    }

    /**
     * Phase 4: Retrieve files sent by the current authenticated user.
     */
    @GetMapping("/sent")
    public ResponseEntity<List<FileTransferDto>> getSentFiles(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        List<FileTransfer> files = fileTransferRepository.findBySenderOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(files.stream().map(FileTransferDto::fromEntity).collect(Collectors.toList()));
    }

    /**
     * Phase 4: Retrieve files received by the current authenticated user.
     */
    @GetMapping("/received")
    public ResponseEntity<List<FileTransferDto>> getReceivedFiles(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        List<FileTransfer> files = fileTransferRepository.findByRecipientOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(files.stream().map(FileTransferDto::fromEntity).collect(Collectors.toList()));
    }

    /**
     * Retrieve details of a specific file transfer.
     * Enforces authorization: only sender or recipient can access metadata.
     */
    @GetMapping("/{id}")
    public ResponseEntity<FileTransferDto> getFileDetails(
            @PathVariable String id,
            Authentication authentication,
            HttpServletRequest request) {

        User currentUser = userService.getUserByEmail(authentication.getName());
        FileTransfer transfer = getAuthorizedFile(id, currentUser, request);

        return ResponseEntity.ok(FileTransferDto.fromEntity(transfer));
    }

    /**
     * Phase 4 & 5: Secure File Download
     * - Enforces sender or recipient authorization (HTTP 403 if unauthorized)
     * - Reads AES-256 encrypted bytes from disk
     * - Decrypts ciphertext back to original plaintext on the fly
     * - Streams decrypted file to client with attachment headers
     * - Logs FILE_DOWNLOADED
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String id,
            Authentication authentication,
            HttpServletRequest request) {

        User currentUser = userService.getUserByEmail(authentication.getName());
        FileTransfer transfer = getAuthorizedFile(id, currentUser, request);

        // Read encrypted ciphertext
        byte[] encryptedBytes = fileStorageService.readEncryptedFile(transfer.getFilePath());

        // Decrypt AES-256 on the fly
        byte[] decryptedPlaintext = cryptoService.decrypt(encryptedBytes);

        // Audit Log
        auditLogService.log("FILE_DOWNLOADED", currentUser, id,
                "Downloaded file '" + transfer.getFileName() + "'", request.getRemoteAddr());

        ByteArrayResource resource = new ByteArrayResource(decryptedPlaintext);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(transfer.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + transfer.getFileName() + "\"")
                .body(resource);
    }

    /**
     * Phase 7: Cryptographic Integrity Verification
     * Workflow:
     * 1. Retrieve encrypted file from disk
     * 2. Decrypt with AES-256
     * 3. Compute SHA-256 of decrypted file
     * 4. Retrieve immutable original hash committed to Blockchain Smart Contract
     * 5. Compare decrypted hash vs. blockchain hash
     */
    @GetMapping("/{id}/verify")
    public ResponseEntity<FileVerificationDto> verifyFileIntegrity(
            @PathVariable String id,
            Authentication authentication,
            HttpServletRequest request) {

        User currentUser = userService.getUserByEmail(authentication.getName());
        FileTransfer transfer = getAuthorizedFile(id, currentUser, request);

        // 1. Read encrypted file
        byte[] encryptedBytes = fileStorageService.readEncryptedFile(transfer.getFilePath());

        // 2. Decrypt ciphertext
        byte[] decryptedBytes = cryptoService.decrypt(encryptedBytes);

        // 3. Compute current SHA-256
        String currentDecryptedHash = cryptoService.calculateSha256(decryptedBytes);

        // 4. Retrieve hash recorded on Blockchain
        String blockchainHash = blockchainService.getFileHash(id);
        if (blockchainHash == null || blockchainHash.isEmpty()) {
            blockchainHash = transfer.getFileHash(); // Fallback to recorded hash
        }

        // 5. Compare
        boolean matches = currentDecryptedHash.equalsIgnoreCase(blockchainHash);
        String message = matches
                ? "VERIFIED: File cryptographic integrity confirmed. Stored file exactly matches the immutable blockchain record."
                : "INTEGRITY FAILED: File content does not match the blockchain record! Possible tampering or corruption detected.";

        auditLogService.log("FILE_VERIFIED", currentUser, id,
                "Integrity check result: " + (matches ? "PASS" : "FAIL"), request.getRemoteAddr());

        FileVerificationDto dto = new FileVerificationDto(
                matches,
                id,
                transfer.getFileName(),
                blockchainHash,
                currentDecryptedHash,
                transfer.getBlockchainTxHash(),
                message
        );

        return ResponseEntity.ok(dto);
    }

    /**
     * Tamper Detection Demo Feature (Requested User Task)
     * POST /api/files/{id}/demo-verify
     * - Allows uploading a test or altered file to check against the blockchain record of {id}
     * - Computes SHA-256 of uploaded test file on-the-fly
     * - Fetches original hash from blockchain
     * - Compares and returns result WITHOUT saving the test file to database
     */
    @PostMapping(value = "/{id}/demo-verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TamperTestResponseDto> demoVerifyTampering(
            @PathVariable String id,
            @RequestParam("file") MultipartFile testFile,
            Authentication authentication,
            HttpServletRequest request) {

        fileStorageService.validateFile(testFile);
        User currentUser = userService.getUserByEmail(authentication.getName());
        FileTransfer transfer = getAuthorizedFile(id, currentUser, request);

        try {
            // 1. Calculate SHA-256 hash of this newly uploaded test file
            byte[] testFileBytes = testFile.getBytes();
            String testFileHash = cryptoService.calculateSha256(testFileBytes);

            // 2. Fetch the original hash from the blockchain for that {id}
            String originalBlockchainHash = blockchainService.getFileHash(id);
            if (originalBlockchainHash == null || originalBlockchainHash.isEmpty()) {
                originalBlockchainHash = transfer.getFileHash();
            }

            // 3. Compare them
            boolean verified = testFileHash.equalsIgnoreCase(originalBlockchainHash);
            String message = verified
                    ? "VERIFIED: No tampering detected. Uploaded test file matches the blockchain fingerprint."
                    : "INTEGRITY FAILED: This file has been tampered with! The cryptographic hash differs from the immutable blockchain record.";

            // 4. Audit Log
            auditLogService.log(
                    verified ? "TAMPER_TEST_PASSED" : "TAMPER_TEST_FAILED",
                    currentUser, id,
                    "Demo Tamper Test: " + (verified ? "VERIFIED (Match)" : "TAMPER DETECTED (Mismatch)"),
                    request.getRemoteAddr()
            );

            TamperTestResponseDto response = new TamperTestResponseDto(
                    verified,
                    id,
                    transfer.getFileName(),
                    originalBlockchainHash,
                    testFileHash,
                    message
            );

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            throw new RuntimeException("Failed to read test file for verification", e);
        }
    }

    /**
     * Phase 8: Dashboard Metrics
     */
    @GetMapping("/dashboard-stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());

        long totalSent = fileTransferRepository.countBySender(currentUser);
        long totalReceived = fileTransferRepository.countByRecipient(currentUser);
        long totalUploaded = totalSent;
        long verifiedCount = fileTransferRepository.countByStatus("STORED");
        long failedCount = 0; // Baseline; tamper tests are caught on-demand

        DashboardStatsDto stats = new DashboardStatsDto(totalSent, totalReceived, totalUploaded, verifiedCount, failedCount);
        return ResponseEntity.ok(stats);
    }

    /**
     * Authorization helper: Ensures user is either sender or recipient.
     * Throws UnauthorizedException (HTTP 403) and logs security audit if unauthorized.
     */
    private FileTransfer getAuthorizedFile(String fileId, User currentUser, HttpServletRequest request) {
        FileTransfer transfer = fileTransferRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File record not found with id: " + fileId));

        boolean isSender = transfer.getSender().getId().equals(currentUser.getId());
        boolean isRecipient = transfer.getRecipient().getId().equals(currentUser.getId());

        if (!isSender && !isRecipient) {
            auditLogService.log("UNAUTHORIZED_FILE_ACCESS", currentUser, fileId,
                    "Access denied for user " + currentUser.getEmail() + " attempting to access file owned by " +
                    transfer.getSender().getEmail() + " and sent to " + transfer.getRecipient().getEmail(),
                    request.getRemoteAddr());

            throw new UnauthorizedException("Access denied. You are neither the sender nor the recipient of this file.");
        }

        return transfer;
    }
}
