package com.portal.service;

import com.portal.entity.AuditLog;
import com.portal.entity.User;
import com.portal.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for managing security and transfer audit logs.
 */
@Service
public class AuditLogService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);
    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Logs an action taken by a user or an attempted action.
     */
    public void log(String action, User user, String fileId, String details, String ipAddress) {
        try {
            Long userId = (user != null) ? user.getId() : null;
            String userEmail = (user != null) ? user.getEmail() : "ANONYMOUS";

            AuditLog entry = new AuditLog(action, userId, userEmail, fileId, details, ipAddress);
            auditLogRepository.save(entry);
            logger.info("AUDIT LOG [{}] user={} fileId={} details={}", action, userEmail, fileId, details);
        } catch (Exception e) {
            logger.error("Failed to record audit log: {}", e.getMessage());
        }
    }

    public List<AuditLog> getUserLogs(Long userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop20ByOrderByTimestampDesc();
    }
}
