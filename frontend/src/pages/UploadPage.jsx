import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Lock, Cpu } from 'lucide-react';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [uploadStep, setUploadStep] = useState(0); // 1: Hashing, 2: Encrypting, 3: Blockchain Commit

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await api.get('/users/recipients');
        setRecipients(response.data);
        if (response.data.length > 0) {
          setRecipientId(response.data[0].id);
        }
      } catch (err) {
        setError('Failed to load recipient list. Please ensure other users are registered.');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchRecipients();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (!recipientId) {
      setError('Please select a recipient.');
      return;
    }

    setError('');
    setLoading(true);
    setUploadStep(1); // Calculating SHA-256

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recipientId', recipientId);

      // Advance visual steps to show user what the backend pipeline is doing
      setTimeout(() => setUploadStep(2), 400); // AES-256 Encrypting
      setTimeout(() => setUploadStep(3), 800); // Blockchain Smart Contract Commit

      const response = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Redirect to newly created file details page
      navigate(`/files/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'File upload and encryption failed.');
      setUploadStep(0);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div style={{ maxWidth: '720px', margin: '1rem auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '50%',
            width: '54px',
            height: '54px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <UploadCloud size={26} color="#06b6d4" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Encrypted File Upload</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Encrypt original content with AES-256 & anchor SHA-256 hash on Blockchain
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            color: '#fb7185',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Recipient Selection */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>
              Select Authorized Recipient
            </label>
            {loadingUsers ? (
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading available recipients...</div>
            ) : recipients.length === 0 ? (
              <div style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.85rem',
                color: '#fbbf24'
              }}>
                No other users found. Please register another user (e.g. Bob or Alice) in a new tab to test file transfer.
              </div>
            ) : (
              <select
                className="form-select"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
              >
                {recipients.map((rec) => (
                  <option key={rec.id} value={rec.id}>
                    {rec.name} ({rec.email}) - {rec.role}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              border: file ? '2px solid var(--accent-cyan)' : '2px dashed rgba(255, 255, 255, 0.15)',
              background: file ? 'rgba(6, 182, 212, 0.05)' : 'rgba(15, 23, 42, 0.6)',
              borderRadius: '16px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'var(--transition)',
              marginBottom: '1.5rem',
              position: 'relative'
            }}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <input
              id="file-upload-input"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {file ? (
              <div>
                <div style={{
                  background: 'rgba(6, 182, 212, 0.2)',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <FileText size={26} color="#22d3ee" />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{file.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {formatFileSize(file.size)} &bull; {file.type || 'Binary Document'}
                </div>
                <div className="badge badge-emerald" style={{ marginTop: '0.75rem' }}>
                  <CheckCircle2 size={12} /> File Ready For Cryptographic Pipeline
                </div>
              </div>
            ) : (
              <div>
                <UploadCloud size={40} color="#64748b" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.35rem' }}>
                  Click to select or drag & drop file here
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Supports all formats: PDF, TXT, DOCX, Images (Max 50MB)
                </div>
              </div>
            )}
          </div>

          {/* Cryptographic Pipeline Status */}
          {loading && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
                Executing Multi-Phase Security Pipeline:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: uploadStep >= 1 ? '#34d399' : '#64748b' }}>
                  <ShieldCheck size={16} /> 1. Computing SHA-256 cryptographic digest...
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: uploadStep >= 2 ? '#34d399' : '#64748b' }}>
                  <Lock size={16} /> 2. Encrypting with AES-256 (IV prepended)...
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: uploadStep >= 3 ? '#34d399' : '#64748b' }}>
                  <Cpu size={16} /> 3. Anchoring hash to Ethereum Smart Contract...
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            disabled={loading || !file || !recipientId}
          >
            {loading ? 'Processing Transfer...' : 'Encrypt & Register on Blockchain'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
