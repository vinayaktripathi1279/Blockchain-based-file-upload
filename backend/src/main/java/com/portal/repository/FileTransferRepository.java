package com.portal.repository;

import com.portal.entity.FileTransfer;
import com.portal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for FileTransfer entity.
 */
@Repository
public interface FileTransferRepository extends JpaRepository<FileTransfer, String> {

    List<FileTransfer> findBySenderOrderByCreatedAtDesc(User sender);

    List<FileTransfer> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<FileTransfer> findBySenderOrRecipientOrderByCreatedAtDesc(User sender, User recipient);

    long countBySender(User sender);

    long countByRecipient(User recipient);

    long countByStatus(String status);
}
