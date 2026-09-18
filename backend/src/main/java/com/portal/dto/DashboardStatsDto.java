package com.portal.dto;

/**
 * DTO for displaying dashboard metrics.
 */
public class DashboardStatsDto {

    private long totalSent;
    private long totalReceived;
    private long totalUploaded;
    private long verifiedCount;
    private long failedCount;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalSent, long totalReceived, long totalUploaded, long verifiedCount, long failedCount) {
        this.totalSent = totalSent;
        this.totalReceived = totalReceived;
        this.totalUploaded = totalUploaded;
        this.verifiedCount = verifiedCount;
        this.failedCount = failedCount;
    }

    public long getTotalSent() {
        return totalSent;
    }

    public void setTotalSent(long totalSent) {
        this.totalSent = totalSent;
    }

    public long getTotalReceived() {
        return totalReceived;
    }

    public void setTotalReceived(long totalReceived) {
        this.totalReceived = totalReceived;
    }

    public long getTotalUploaded() {
        return totalUploaded;
    }

    public void setTotalUploaded(long totalUploaded) {
        this.totalUploaded = totalUploaded;
    }

    public long getVerifiedCount() {
        return verifiedCount;
    }

    public void setVerifiedCount(long verifiedCount) {
        this.verifiedCount = verifiedCount;
    }

    public long getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(long failedCount) {
        this.failedCount = failedCount;
    }
}
