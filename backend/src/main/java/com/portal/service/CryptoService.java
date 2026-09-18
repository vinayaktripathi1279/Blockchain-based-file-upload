package com.portal.service;

import com.portal.exception.FileStorageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;

/**
 * CryptoService:
 * Handles cryptographic operations for the portal:
 * 1. AES-256 Encryption & Decryption (using AES/CBC/PKCS5Padding with dynamic random IV).
 * 2. SHA-256 Cryptographic Hash generation for data integrity checking.
 *
 * NOTE FOR BEGINNERS:
 * - AES (Advanced Encryption Standard) is a symmetric cipher; the same 256-bit key encrypts and decrypts.
 * - An IV (Initialization Vector) ensures identical files encrypt to completely different ciphertexts every time.
 * - The 16-byte IV is prepended to the encrypted file bytes so the decryptor can read it.
 */
@Service
public class CryptoService {

    private static final Logger logger = LoggerFactory.getLogger(CryptoService.class);
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding";
    private static final int IV_SIZE = 16; // 128-bit IV for AES

    private final byte[] secretKeyBytes;

    public CryptoService(@Value("${app.crypto.secret-key}") String secretKey) {
        byte[] rawBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        // Ensure exactly 32 bytes (256 bits)
        if (rawBytes.length != 32) {
            byte[] key32 = new byte[32];
            System.arraycopy(rawBytes, 0, key32, 0, Math.min(rawBytes.length, 32));
            this.secretKeyBytes = key32;
        } else {
            this.secretKeyBytes = rawBytes;
        }
    }

    /**
     * Encrypts plaintext bytes using AES-256.
     * Generates a cryptographically secure 16-byte random IV, prepends it to the ciphertext,
     * and returns the resulting byte array.
     */
    public byte[] encrypt(byte[] plaintext) {
        try {
            // 1. Generate random IV
            byte[] iv = new byte[IV_SIZE];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);

            // 2. Initialize Cipher in ENCRYPT_MODE
            SecretKeySpec keySpec = new SecretKeySpec(secretKeyBytes, ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);

            // 3. Encrypt data
            byte[] cipherBytes = cipher.doFinal(plaintext);

            // 4. Combine IV + Ciphertext
            byte[] encryptedWithIv = new byte[iv.length + cipherBytes.length];
            System.arraycopy(iv, 0, encryptedWithIv, 0, iv.length);
            System.arraycopy(cipherBytes, 0, encryptedWithIv, iv.length, cipherBytes.length);

            return encryptedWithIv;
        } catch (Exception e) {
            logger.error("Failed to encrypt file data: {}", e.getMessage(), e);
            throw new FileStorageException("Error encrypting file with AES-256", e);
        }
    }

    /**
     * Decrypts AES-256 encrypted bytes containing a prepended 16-byte IV.
     */
    public byte[] decrypt(byte[] encryptedWithIv) {
        try {
            if (encryptedWithIv.length <= IV_SIZE) {
                throw new IllegalArgumentException("Encrypted data is too short to contain an IV");
            }

            // 1. Extract 16-byte IV from beginning
            byte[] iv = Arrays.copyOfRange(encryptedWithIv, 0, IV_SIZE);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);

            // 2. Extract remaining ciphertext bytes
            byte[] ciphertext = Arrays.copyOfRange(encryptedWithIv, IV_SIZE, encryptedWithIv.length);

            // 3. Initialize Cipher in DECRYPT_MODE
            SecretKeySpec keySpec = new SecretKeySpec(secretKeyBytes, ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);

            // 4. Decrypt and return original plaintext
            return cipher.doFinal(ciphertext);
        } catch (Exception e) {
            logger.error("Failed to decrypt file data: {}", e.getMessage(), e);
            throw new FileStorageException("Error decrypting file with AES-256. The file may be corrupt or tampered with.", e);
        }
    }

    /**
     * Calculates the SHA-256 hexadecimal hash string for a byte array.
     */
    public String calculateSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(data);
            return bytesToHex(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Calculates the SHA-256 hexadecimal hash for an InputStream.
     */
    public String calculateSha256(InputStream inputStream) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }
            return bytesToHex(digest.digest());
        } catch (Exception e) {
            throw new RuntimeException("Error calculating SHA-256 from input stream", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
