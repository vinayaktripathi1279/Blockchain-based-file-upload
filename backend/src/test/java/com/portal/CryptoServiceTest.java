package com.portal;

import com.portal.service.CryptoService;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

public class CryptoServiceTest {

    private final CryptoService cryptoService = new CryptoService("12345678901234567890123456789012");

    @Test
    void testAes256EncryptionAndDecryption() {
        String originalText = "Salary: $5,000 - Highly Confidential Contract";
        byte[] originalBytes = originalText.getBytes(StandardCharsets.UTF_8);

        // Encrypt
        byte[] encryptedBytes = cryptoService.encrypt(originalBytes);
        assertNotNull(encryptedBytes);
        assertNotEquals(originalText, new String(encryptedBytes, StandardCharsets.UTF_8));

        // Decrypt
        byte[] decryptedBytes = cryptoService.decrypt(encryptedBytes);
        String decryptedText = new String(decryptedBytes, StandardCharsets.UTF_8);

        assertEquals(originalText, decryptedText);
    }

    @Test
    void testSha256HashCalculation() {
        byte[] data1 = "Salary: $5,000".getBytes(StandardCharsets.UTF_8);
        byte[] data2 = "Salary: $9,000".getBytes(StandardCharsets.UTF_8);

        String hash1 = cryptoService.calculateSha256(data1);
        String hash2 = cryptoService.calculateSha256(data2);

        assertNotNull(hash1);
        assertEquals(64, hash1.length()); // SHA-256 is 64 hex characters
        assertNotEquals(hash1, hash2, "Altered content must produce completely different cryptographic hashes");
    }
}
