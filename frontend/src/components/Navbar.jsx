import React from 'react';
import { Compass, CalendarCheck, PlusCircle, Globe } from 'lucide-react';

export default function Navbar({
  currency,
  onCurrencyChange,
  reservationsCount,
  onOpenBookings,
  onOpenAddModal
}) {
  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-icon">
            <Compass size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title">QTrip</span>
              <span className="brand-badge">Bespoke</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {/* Currency Switcher */}
          <div className="currency-select-wrapper" title="Select display currency">
            <Globe size={14} style={{ color: 'var(--stone-600)' }} />
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              aria-label="Currency"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          {/* Dynamic Component Creator (+ List Experience) */}
          <button
            className="btn btn-stone-outline btn-pill"
            onClick={onOpenAddModal}
            title="Dynamically add destination or activity"
          >
            <PlusCircle size={15} />
            <span>List Experience</span>
          </button>

          {/* My Reservations Button */}
          <button
            className="btn btn-sage-primary btn-pill"
            onClick={onOpenBookings}
          >
            <CalendarCheck size={16} />
            <span>My Bookings</span>
            {reservationsCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--terracotta)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  marginLeft: '2px'
                }}
              >
                {reservationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
