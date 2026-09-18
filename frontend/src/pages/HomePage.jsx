import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Cpu, CheckCircle, ArrowRight, FileCheck, Layers, EyeOff, AlertTriangle } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '4rem 1rem 3rem' }}>
        <div className="badge badge-cyan" style={{ marginBottom: '1.25rem', padding: '0.4rem 1rem' }}>
          <Shield size={14} /> Cryptographic File Security + Ethereum Smart Contract
        </div>
        <h1 style={{
          fontSize: '3.2rem',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Blockchain-Based Secure<br />File Transfer Portal
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '750px',
          margin: '0 auto 2.5rem',
          fontWeight: 400
        }}>
          End-to-end confidential file transfer protected by <strong style={{ color: '#fff' }}>AES-256 military-grade encryption</strong> at rest, paired with an <strong style={{ color: '#22d3ee' }}>immutable blockchain ledger</strong> to mathematically prove zero unauthorized file tampering.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
              Open Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                Enter Portal <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-outline" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                Create Account
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 4 Pillars Architecture */}
      <section style={{ margin: '4rem 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, marginBottom: '2.5rem' }}>
          Enterprise Cryptographic Architecture
        </h2>

        <div className="grid-4">
          <div className="glass-card glass-card-interactive">
            <div style={{
              background: 'rgba(6, 182, 212, 0.15)',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Lock size={22} color="#06b6d4" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>AES-256 Encryption</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Files are encrypted with AES-256-CBC and unique 16-byte random IVs before ever touching disk. Plaintext is never stored on disk.
            </p>
          </div>

          <div className="glass-card glass-card-interactive">
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Cpu size={22} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Smart Contract Registry</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              SHA-256 file fingerprints are committed to a Solidity smart contract on an Ethereum-compatible chain for tamper-proof history.
            </p>
          </div>

          <div className="glass-card glass-card-interactive">
            <div style={{
              background: 'rgba(139, 92, 246, 0.15)',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Layers size={22} color="#8b5cf6" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Strict Access Control</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Only the authenticated sender or intended recipient can decrypt and download. Unauthorized downloads are blocked with HTTP 403.
            </p>
          </div>

          <div className="glass-card glass-card-interactive">
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={22} color="#f43f5e" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tamper Detection Demo</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Interactive demo feature lets you upload an altered file to prove on-the-fly how mathematical hashes catch even 1 altered character!
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Diagram Section */}
      <section className="glass-card" style={{ padding: '2.5rem', marginBottom: '4rem' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
          Cryptographic Lifecycle: Upload to Verification
        </h3>

        <div className="grid-3" style={{ textAlign: 'center' }}>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄 ➡️ 🔒</div>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>1. Upload & Encrypt</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Original file is hashed (SHA-256), encrypted with AES-256, and stored in <code>/uploads/encrypted/</code>.
            </div>
          </div>

          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔗 ➡️ ⛓️</div>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>2. Blockchain Commit</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              File SHA-256 fingerprint is permanently recorded on the Solidity smart contract, returning a transaction hash.
            </div>
          </div>

          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍 ➡️ 🛡️</div>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>3. Verified Access</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Authorized recipient downloads and decrypts on-the-fly with real-time mathematical integrity checks.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
