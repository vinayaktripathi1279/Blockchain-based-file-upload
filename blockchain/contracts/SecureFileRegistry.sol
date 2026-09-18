// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SecureFileRegistry
 * @dev Stores immutable cryptographic file hashes (SHA-256) on-chain.
 * Files themselves are NOT stored on the blockchain; only their fingerprint (hash).
 */
contract SecureFileRegistry {

    struct FileRecord {
        string fileHash;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from fileId (UUID string) to FileRecord
    mapping(string => FileRecord) private records;

    // Emitted whenever a file is registered on the blockchain
    event FileRegistered(string indexed fileId, string fileHash, uint256 timestamp);

    /**
     * @notice Registers a new file hash on-chain.
     * @param fileId Unique identifier of the file transfer
     * @param fileHash SHA-256 hexadecimal hash of the original plaintext file
     */
    function registerFile(string memory fileId, string memory fileHash) external {
        require(bytes(fileId).length > 0, "fileId cannot be empty");
        require(bytes(fileHash).length > 0, "fileHash cannot be empty");
        require(!records[fileId].exists, "File record already exists on blockchain");

        records[fileId] = FileRecord({
            fileHash: fileHash,
            timestamp: block.timestamp,
            exists: true
        });

        emit FileRegistered(fileId, fileHash, block.timestamp);
    }

    /**
     * @notice Retrieves the registered file hash for a given fileId.
     * @param fileId Unique identifier of the file transfer
     * @return Registered SHA-256 file hash string
     */
    function getFileHash(string memory fileId) external view returns (string memory) {
        require(records[fileId].exists, "File record not found on blockchain");
        return records[fileId].fileHash;
    }

    /**
     * @notice Verifies if a provided file hash matches the on-chain record.
     * @param fileId Unique identifier of the file transfer
     * @param fileHash SHA-256 hash to test against the blockchain
     * @return True if hashes match exactly, false otherwise
     */
    function verifyFileHash(string memory fileId, string memory fileHash) external view returns (bool) {
        if (!records[fileId].exists) {
            return false;
        }
        return keccak256(bytes(records[fileId].fileHash)) == keccak256(bytes(fileHash));
    }
}
