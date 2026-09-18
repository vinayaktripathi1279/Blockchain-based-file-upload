import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Key, Lock, CheckCircle2 } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '750px', margin: '1rem auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
            borderRadius: '50%',
            width: '74px',
            height: '74px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)'
          }}>
            <User size={36} color="#fff" />
          </div>

          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{user?.name}</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user?.email}</div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className="badge badge-cyan">{user?.role}</span>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} color="#06b6d4" /> Security & Cryptographic Identity
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Account ID</div>
              <div style={{ fontWeight: 600 }}>{user?.id}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Auth Mechanism</div>
              <div style={{ fontWeight: 600 }}>JWT (HMAC-SHA256)</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Password Hashing</div>
              <div style={{ fontWeight: 600 }}>BCrypt (Salt Rounds: 10)</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Storage Encryption</div>
              <div style={{ fontWeight: 600 }}>AES-256-CBC</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
