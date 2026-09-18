import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, CheckCircle2, AlertTriangle, Cpu, RefreshCw, Layers, FileText } from 'lucide-react';

const VerifyPage = () => {
  const [allFiles, setAllFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState('');
  const [verificationData, setVerificationData] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllAccessibleFiles = async () => {
      try {
        const [sentRes, recvRes] = await Promise.all([
          api.get('/files/sent'),
          api.get('/files/received')
        ]);

        const combined = [...sentRes.data, ...recvRes.data];
        // Deduplicate
        const unique = Array.from(new Map(combined.map(f => [f.id, f])).values());
        setAllFiles(unique);
        if (unique.length > 0) {
          setSelectedFileId(unique[0].id);
        }
      } catch (err) {
        setError('Failed to load user files for verification.');
      } finally {
        setLoadingFiles(false);
      }
    };

    fetchAllAccessibleFiles();
  }, []);

  const handleRunVerification = async (fileIdToVerify) => {
    const targetId = fileIdToVerify || selectedFileId;
    if (!targetId) return;

    setVerifying(true);
    setError('');
    setVerificationData(null);

    try {
      const res = await api.get(`/files/${targetId}/verify`);
      setVerificationData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. File might be missing or unauthorized.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '50%',
            width: '54px',
            height: '54px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={28} color="#34d399" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Cryptographic Verification Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Decrypt ciphertext & compare on-the-fly SHA-256 against immutable Ethereum records
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', padding: '1rem', borderRadius: '10px', color: '#fb7185', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertTriangle size={18} /> <span>{error}</span>
          </div>
        )}

        {/* File selector */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <label className="form-label">Select File to Verify</label>
            {loadingFiles ? (
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading files...</div>
            ) : allFiles.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No transfers found. Please upload a file first.</div>
            ) : (
              <select
                className="form-select"
                style={{ width: '100%' }}
                value={selectedFileId}
                onChange={(e) => setSelectedFileId(e.target.value)}
              >
                {allFiles.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fileName} (ID: {f.id.substring(0, 8)}... - {f.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={() => handleRunVerification(selectedFileId)}
              className="btn btn-emerald"
              style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem' }}
              disabled={verifying || !selectedFileId}
            >
              <RefreshCw size={16} className={verifying ? 'pulse-glow' : ''} />
              {verifying ? 'Decrypting & Comparing...' : 'Run Integrity Check'}
            </button>
          </div>
        </div>

        {/* Verification Result Display */}
        {verificationData && (
          <div style={{
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            {/* Verdict Card */}
            <div style={{
              background: verificationData.verified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `2px solid ${verificationData.verified ? '#10b981' : '#f43f5e'}`,
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              {verificationData.verified ? (
                <>
                  <CheckCircle2 size={50} color="#34d399" style={{ marginBottom: '0.5rem' }} />
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
                    CRYPTOGRAPHIC INTEGRITY VERIFIED
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    {verificationData.message}
                  </p>
                </>
              ) : (
                <>
                  <AlertTriangle size={50} color="#f43f5e" style={{ marginBottom: '0.5rem' }} />
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f43f5e' }}>
                    INTEGRITY CHECK FAILED
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    {verificationData.message}
                  </p>
                </>
              )}
            </div>

            {/* Verification Detail Grid */}
            <div className="grid-2">
              <div className="glass-card">
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Decrypted Local File SHA-256
                </div>
                <div className="hash-pill" style={{ width: '100%', padding: '0.5rem' }}>
                  {verificationData.currentDecryptedHash}
                </div>
              </div>

              <div className="glass-card">
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Original Blockchain Registry Hash
                </div>
                <div className="hash-pill" style={{ width: '100%', padding: '0.5rem', color: '#34d399' }}>
                  {verificationData.originalBlockchainHash}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Blockchain Transaction:{' '}
              <span className="hash-pill" style={{ color: '#a78bfa', marginLeft: '0.5rem' }}>
                {verificationData.blockchainTxHash}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;
