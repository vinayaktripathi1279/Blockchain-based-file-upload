import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Send, Download, ShieldCheck, FileText, ArrowUpRight, Search, AlertCircle } from 'lucide-react';

const SentFilesPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchSentFiles = async () => {
    try {
      const res = await api.get('/files/sent');
      setFiles(res.data);
    } catch (err) {
      setError('Failed to load sent files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentFiles();
  }, []);

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Download failed: ' + (err.response?.data?.message || 'Access denied or server error'));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filtered = files.filter(f =>
    f.fileName.toLowerCase().includes(search.toLowerCase()) ||
    (f.recipientEmail && f.recipientEmail.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Send size={26} color="#06b6d4" /> Sent Files
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Encrypted files you have transferred and anchored to the blockchain
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.4rem' }}
            placeholder="Search files or recipients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', padding: '1rem', borderRadius: '10px', color: '#fb7185', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading your sent files...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <FileText size={48} color="#64748b" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>No sent files found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
            You haven't uploaded or sent any encrypted files yet.
          </p>
          <Link to="/upload" className="btn btn-primary">
            Upload Your First File
          </Link>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '0.5rem' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>File Details</th>
                  <th>Recipient</th>
                  <th>Size</th>
                  <th>Original SHA-256 Digest</th>
                  <th>Blockchain Tx</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.fileName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(file.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{file.recipientName || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{file.recipientEmail}</div>
                    </td>
                    <td>{formatFileSize(file.fileSize)}</td>
                    <td>
                      <span className="hash-pill" title={file.fileHash}>
                        {file.fileHash?.substring(0, 16)}...
                      </span>
                    </td>
                    <td>
                      <span className="hash-pill" style={{ color: '#a78bfa' }} title={file.blockchainTxHash}>
                        {file.blockchainTxHash ? `${file.blockchainTxHash.substring(0, 12)}...` : 'Local Mock'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleDownload(file.id, file.fileName)}
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                          title="Decrypt and download"
                        >
                          <Download size={14} /> Download
                        </button>
                        <Link
                          to={`/files/${file.id}`}
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                          title="Inspect file & Tamper Demo"
                        >
                          <ShieldCheck size={14} /> Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentFilesPage;
