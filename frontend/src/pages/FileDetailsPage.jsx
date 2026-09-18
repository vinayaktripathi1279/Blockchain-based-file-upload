import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  Shield,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Cpu,
  User,
  Calendar,
  Layers,
  ArrowLeft,
  Copy,
  Check,
  UploadCloud,
  Play
} from 'lucide-react';

const FileDetailsPage = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  // System verification state
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Tamper Demo state
  const [demoFile, setDemoFile] = useState(null);
  const [runningTamperTest, setRunningTamperTest] = useState(false);
  const [tamperResult, setTamperResult] = useState(null);

  useEffect(() => {
    fetchFileDetails();
  }, [id]);

  const fetchFileDetails = async () => {
    try {
      const res = await api.get(`/files/${id}`);
      setFile(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load file details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/files/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Download error: ' + (err.response?.data?.message || 'Access forbidden or error'));
    }
  };

  // Standard Integrity Check against stored decrypted file
  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    try {
      const res = await api.get(`/files/${id}/verify`);
      setVerificationResult(res.data);
    } catch (err) {
      alert('Verification request failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setVerifying(false);
    }
  };

  // Tamper Detection Demo Test
  const handleTamperTest = async (e) => {
    e.preventDefault();
    if (!demoFile) {
      alert('Please select a file to test.');
      return;
    }

    setRunningTamperTest(true);
    setTamperResult(null);

    try {
      const formData = new FormData();
      formData.append('file', demoFile);

      const res = await api.post(`/files/${id}/demo-verify`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setTamperResult(res.data);
    } catch (err) {
      alert('Tamper test error: ' + (err.response?.data?.message || err.message));
    } finally {
      setRunningTamperTest(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading cryptographic record...</div>;
  }

  if (error || !file) {
    return (
      <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
        <AlertTriangle size={48} color="#f43f5e" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Access Denied or Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 1.5rem' }}>{error}</p>
        <Link to="/dashboard" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Back Link */}
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Header Card */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-cyan">
                <Lock size={12} /> AES-256 Encrypted
              </span>
              <span className="badge badge-violet">
                <Cpu size={12} /> Blockchain Anchored
              </span>
              <span className="badge badge-emerald">
                <CheckCircle2 size={12} /> Status: {file.status}
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, wordBreak: 'break-all' }}>
              {file.fileName}
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              File ID: <span style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>{file.id}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={handleDownload} className="btn btn-primary" style={{ padding: '0.7rem 1.3rem' }}>
              <Download size={18} /> Decrypt & Download
            </button>
            <button onClick={handleVerifyIntegrity} className="btn btn-emerald" style={{ padding: '0.7rem 1.3rem' }} disabled={verifying}>
              <Shield size={18} /> {verifying ? 'Verifying...' : 'Verify On-Chain'}
            </button>
          </div>
        </div>

        {/* Verification Alert Banner if run */}
        {verificationResult && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            borderRadius: '12px',
            background: verificationResult.verified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${verificationResult.verified ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {verificationResult.verified ? (
              <CheckCircle2 size={28} color="#34d399" />
            ) : (
              <AlertTriangle size={28} color="#fb7185" />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: verificationResult.verified ? '#34d399' : '#fb7185' }}>
                {verificationResult.verified ? 'INTEGRITY CONFIRMED' : 'INTEGRITY BREACH DETECTED'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {verificationResult.message}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metadata & Cryptographic Fingerprints */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Transfer Parties */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#06b6d4" /> Participants & Transfer Info
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Sender</div>
              <div style={{ fontWeight: 600 }}>{file.senderName}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{file.senderEmail}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Authorized Recipient</div>
              <div style={{ fontWeight: 600 }}>{file.recipientName}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{file.recipientEmail}</div>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>File Size</div>
                <div style={{ fontWeight: 600 }}>{formatFileSize(file.fileSize)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>MIME Type</div>
                <div style={{ fontWeight: 600 }}>{file.contentType}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Timestamp</div>
                <div style={{ fontWeight: 600 }}>{new Date(file.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic Proofs */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} color="#10b981" /> Immutable Cryptographic Record
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Original SHA-256 Digest
                </span>
                <button
                  onClick={() => copyToClipboard(file.fileHash, 'sha')}
                  style={{ background: 'none', color: '#06b6d4', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  {copiedField === 'sha' ? <Check size={13} /> : <Copy size={13} />} {copiedField === 'sha' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="hash-pill" style={{ width: '100%', padding: '0.55rem 0.75rem' }}>
                {file.fileHash}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Ethereum Blockchain Transaction Hash
                </span>
                <button
                  onClick={() => copyToClipboard(file.blockchainTxHash, 'tx')}
                  style={{ background: 'none', color: '#a78bfa', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  {copiedField === 'tx' ? <Check size={13} /> : <Copy size={13} />} {copiedField === 'tx' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="hash-pill" style={{ width: '100%', padding: '0.55rem 0.75rem', color: '#c084fc' }}>
                {file.blockchainTxHash || 'Local EVM Mock Tx'}
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              🔒 <strong>Confidentiality guarantee:</strong> The physical file is stored strictly as AES-256 ciphertext in <code>/uploads/encrypted/</code>. The blockchain ledger stores only this 256-bit cryptographic fingerprint.
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAMPER DETECTION DEMO AREA (REQUESTED DEMO FEATURE)     */}
      {/* ======================================================== */}
      <div className="glass-card" style={{
        padding: '2.5rem',
        border: '2px solid rgba(6, 182, 212, 0.4)',
        background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 14, 23, 0.95) 100%)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%)',
            padding: '0.5rem',
            borderRadius: '10px'
          }}>
            <AlertTriangle size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Tamper Detection Demonstration Area</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Test & visually prove how the Blockchain detects unauthorized tampering or byte-level modification.
            </p>
          </div>
        </div>

        {/* Demo instructions */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          margin: '1.25rem 0 1.75rem',
          fontSize: '0.85rem',
          lineHeight: 1.6
        }}>
          <strong>How to run the demo for interviewers/evaluators:</strong>
          <ol style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
            <li>Upload a test file (e.g. modify 1 character inside a text file like changing <em>"Salary: $5,000"</em> to <em>"$9,000"</em>).</li>
            <li>Click <strong>"Run Tamper Test"</strong> to compute its SHA-256 hash on-the-fly and check it against the immutable blockchain hash.</li>
            <li>Watch the system mathematically detect the discrepancy and trigger the high-visibility alert!</li>
          </ol>
        </div>

        {/* Upload test file form */}
        <form onSubmit={handleTamperTest}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>
              Upload a file to test integrity against this record:
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="file"
                id="tamper-file-input"
                className="form-input"
                style={{ flex: 1, padding: '0.65rem' }}
                onChange={(e) => setDemoFile(e.target.files[0])}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
                disabled={runningTamperTest || !demoFile}
              >
                <Play size={16} /> {runningTamperTest ? 'Computing & Comparing...' : 'Run Tamper Test'}
              </button>
            </div>
            {demoFile && (
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                Selected test file: <strong>{demoFile.name}</strong> ({formatFileSize(demoFile.size)})
              </div>
            )}
          </div>
        </form>

        {/* Tamper Test Visual Output Result */}
        {tamperResult && (
          <div style={{ marginTop: '2rem' }}>
            {/* Side-by-Side Hash Comparison */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.75rem'
            }}>
              {/* Original Blockchain Hash */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#22d3ee', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Cpu size={14} /> 1. Original Blockchain Hash (Immutable)
                </div>
                <div className="hash-pill" style={{ fontSize: '0.82rem', padding: '0.65rem', width: '100%' }}>
                  {tamperResult.originalBlockchainHash}
                </div>
              </div>

              {/* Uploaded Test File Hash */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: `1px solid ${tamperResult.verified ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: tamperResult.verified ? '#34d399' : '#fb7185', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={14} /> 2. Uploaded Test File Hash (Computed On-the-Fly)
                </div>
                <div className="hash-pill" style={{ fontSize: '0.82rem', padding: '0.65rem', width: '100%', color: tamperResult.verified ? '#34d399' : '#fb7185' }}>
                  {tamperResult.testFileHash}
                </div>
              </div>
            </div>

            {/* High-Visibility Verdict Banner */}
            {tamperResult.verified ? (
              <div className="tamper-alert-success">
                <CheckCircle2 size={54} color="#34d399" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', letterSpacing: '-0.01em' }}>
                  VERIFIED: No tampering detected.
                </h3>
                <p style={{ color: '#e2e8f0', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '650px', margin: '0.5rem auto 0' }}>
                  The uploaded file's cryptographic SHA-256 fingerprint matches the immutable blockchain record with 100% mathematical precision!
                </p>
              </div>
            ) : (
              <div className="tamper-alert-failed">
                <AlertTriangle size={58} color="#f43f5e" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#f43f5e', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  🚨 INTEGRITY FAILED: This file has been tampered with!
                </h3>
                <p style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600, marginTop: '0.65rem', maxWidth: '700px', margin: '0.65rem auto 0' }}>
                  The uploaded file does NOT match the immutable hash recorded on the blockchain. Even a single changed character produces a completely different hash, proving unauthorized alteration!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDetailsPage;
