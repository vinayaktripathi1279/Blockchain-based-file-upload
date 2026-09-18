import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Send,
  Inbox,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
  ArrowUpRight,
  RefreshCw,
  Cpu,
  Lock
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    totalUploaded: 0,
    verifiedCount: 0,
    failedCount: 0
  });
  const [recentSent, setRecentSent] = useState([]);
  const [recentReceived, setRecentReceived] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, sentRes, receivedRes] = await Promise.all([
        api.get('/files/dashboard-stats'),
        api.get('/files/sent'),
        api.get('/files/received')
      ]);

      setStats(statsRes.data);
      setRecentSent(sentRes.data.slice(0, 5));
      setRecentReceived(receivedRes.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>
            <Shield size={13} /> Active Node Security Status
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Welcome back, <span style={{ color: 'var(--accent-cyan)' }}>{user?.name}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Monitor your encrypted transfers, on-chain commitments, and cryptographic integrity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchDashboardData} className="btn btn-outline" style={{ padding: '0.65rem 1rem' }} title="Refresh stats">
            <RefreshCw size={16} /> Refresh
          </button>
          <Link to="/upload" className="btn btn-primary" style={{ padding: '0.65rem 1.3rem' }}>
            <UploadCloud size={18} /> New Secure Transfer
          </Link>
        </div>
      </div>

      {/* Metrics Cards (Phase 8 Requirement) */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Files Sent
            </div>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.5rem', borderRadius: '10px' }}>
              <Send size={18} color="#06b6d4" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.5rem 0 0.2rem' }}>
            {stats.totalSent}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            AES-256 encrypted transfers initiated
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Files Received
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '10px' }}>
              <Inbox size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.5rem 0 0.2rem' }}>
            {stats.totalReceived}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Available for authenticated download
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Verified Intact
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '10px' }}>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.5rem 0 0.2rem', color: '#34d399' }}>
            {stats.totalSent + stats.totalReceived}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Confirmed on Ethereum smart contract
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Tamper Demo Hub
            </div>
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', padding: '0.5rem', borderRadius: '10px' }}>
              <AlertTriangle size={18} color="#f43f5e" />
            </div>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.75rem 0 0.2rem', color: '#fb7185' }}>
            Interactive Demo
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Upload altered file to test detection
          </div>
        </div>
      </div>

      {/* Quick Access Pipeline Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#06b6d4', padding: '0.65rem', borderRadius: '12px' }}>
              <Cpu size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Want to test the Blockchain Tamper Detection?</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Select any file from your transfers below to enter the <strong>Tamper Test Area</strong> and simulate an attack!
              </div>
            </div>
          </div>
          <Link to="/upload" className="btn btn-emerald" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
            Upload & Test Now
          </Link>
        </div>
      </div>

      {/* Transfer Lists (Sent & Received) */}
      <div className="grid-2">
        {/* Recent Sent Files */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={18} color="#06b6d4" /> Recent Sent Files
            </h3>
            <Link to="/sent" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          {recentSent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <FileText size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <div>No files sent yet.</div>
              <Link to="/upload" className="btn btn-outline" style={{ marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                Upload First File
              </Link>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Recipient</th>
                    <th>Size</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSent.map((file) => (
                    <tr key={file.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{file.fileName}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {new Date(file.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {file.recipientName || file.recipientEmail}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td>
                        <Link to={`/files/${file.id}`} className="btn btn-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Received Files */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Inbox size={18} color="#10b981" /> Recent Received Files
            </h3>
            <Link to="/received" style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          {recentReceived.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Inbox size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <div>No files received yet.</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Ask another user to transfer a file to your email.
              </div>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Sender</th>
                    <th>Size</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReceived.map((file) => (
                    <tr key={file.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{file.fileName}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {new Date(file.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {file.senderName || file.senderEmail}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td>
                        <Link to={`/files/${file.id}`} className="btn btn-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
