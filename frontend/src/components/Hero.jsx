import React from 'react';
import { Search, Sparkles, ShieldCheck, Clock, Award, Users } from 'lucide-react';

export default function Hero({ searchQuery, onSearchChange, onQuickSelectCity }) {
  return (
    <section className="hero-section">
      <div className="hero-card">
        <div className="hero-bg-overlay"></div>

        <div className="hero-content">
          <div className="hero-eyebrow">
            <Sparkles size={14} style={{ color: 'var(--sage-200)' }} />
            <span>Slow Travel & Mindful Expeditions</span>
          </div>

          <h1 className="hero-title">
            Where ancient stones meet <em>serene horizons.</em>
          </h1>

          <p className="hero-subtitle">
            Immerse yourself in hand-crafted small group journeys, private tea rituals,
            and alpine ridge walks designed for the conscious traveler.
          </p>

          {/* Interactive Search Bar */}
          <div className="hero-search-box">
            <div className="search-input-wrapper">
              <Search size={18} style={{ color: 'var(--sage-600)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by destination (e.g. Kyoto, Amalfi, Zermatt) or activity..."
                aria-label="Search destinations and adventures"
              />
            </div>
            <button
              className="btn btn-sage-primary"
              onClick={() => {
                const el = document.getElementById('adventures-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Now
            </button>
          </div>

          {/* Quick Destination Suggestion Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--sage-200)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Popular:
            </span>
            {['Kyoto', 'Amalfi Coast', 'Swiss Alps', 'Ubud, Bali', 'Banff'].map((item) => (
              <button
                key={item}
                onClick={() => onQuickSelectCity(item)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  transition: 'background 160ms ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.25)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.12)'}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Trust and Reliability Bar */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <Award size={16} style={{ color: 'var(--sage-200)' }} />
              <span><span className="highlight">4.96★</span> Traveler Rated</span>
            </div>
            <div className="trust-item">
              <ShieldCheck size={16} style={{ color: 'var(--sage-200)' }} />
              <span><span className="highlight">100%</span> Verified Local Guides</span>
            </div>
            <div className="trust-item">
              <Clock size={16} style={{ color: 'var(--sage-200)' }} />
              <span><span className="highlight">Free</span> Cancellation (48h)</span>
            </div>
            <div className="trust-item">
              <Users size={16} style={{ color: 'var(--sage-200)' }} />
              <span><span className="highlight">Max 8-10</span> Small Groups</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
