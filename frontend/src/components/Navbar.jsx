import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UploadCloud, Send, Inbox, CheckCircle2, User, LogOut, Lock } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      background: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
            borderRadius: '10px',
            padding: '0.45rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
          }}>
            <ShieldCheck size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              CipherChain<span style={{ color: '#06b6d4', WebkitTextFillColor: '#06b6d4' }}>Portal</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              Blockchain File Transfer
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link
              to="/dashboard"
              className="btn btn-outline"
              style={{
                padding: '0.5rem 0.9rem',
                fontSize: '0.85rem',
                borderColor: isActive('/dashboard') ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                color: isActive('/dashboard') ? 'var(--accent-cyan)' : 'var(--text-secondary)'
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              className="btn btn-primary"
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
            >
              <UploadCloud size={16} /> Upload File
            </Link>
            <Link
              to="/sent"
              className="btn btn-outline"
              style={{
                padding: '0.5rem 0.9rem',
                fontSize: '0.85rem',
                borderColor: isActive('/sent') ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                color: isActive('/sent') ? 'var(--accent-cyan)' : 'var(--text-secondary)'
              }}
            >
              <Send size={15} /> Sent
            </Link>
            <Link
              to="/received"
              className="btn btn-outline"
              style={{
                padding: '0.5rem 0.9rem',
                fontSize: '0.85rem',
                borderColor: isActive('/received') ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                color: isActive('/received') ? 'var(--accent-cyan)' : 'var(--text-secondary)'
              }}
            >
              <Inbox size={15} /> Received
            </Link>
            <Link
              to="/verify"
              className="btn btn-outline"
              style={{
                padding: '0.5rem 0.9rem',
                fontSize: '0.85rem',
                borderColor: isActive('/verify') ? 'var(--accent-emerald)' : 'var(--border-subtle)',
                color: isActive('/verify') ? 'var(--accent-emerald)' : 'var(--text-secondary)'
              }}
            >
              <CheckCircle2 size={15} /> Verify Hub
            </Link>
          </nav>
        ) : null}

        {/* User Status / Login Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={18} color="#22d3ee" />
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{user.email}</div>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: '#f43f5e' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <Lock size={15} /> Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
