import React, { useState } from 'react';
import { X, CalendarCheck, Clock, MapPin, Users, AlertTriangle, CheckCircle2, Ban, Printer, FileText } from 'lucide-react';
import { api } from '../services/api';

export default function MyBookingsModal({
  reservations,
  currency,
  exchangeRates,
  onClose,
  onReservationCancelled
}) {
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const rate = exchangeRates[currency] || 1;
  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };
  const symbol = currencySymbols[currency] || '$';

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you wish to cancel this reservation? A 100% refund will be processed back to your original payment method within 3-5 business days under our 48h guarantee.')) {
      return;
    }

    setCancellingId(id);
    try {
      const result = await api.cancelReservation(id);
      if (onReservationCancelled) onReservationCancelled(result.reservation);
    } catch (err) {
      alert(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" style={{ maxWidth: '840px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px', borderBottom: '1px solid var(--stone-200)', backgroundColor: 'var(--stone-50)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--sage-700)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>My Reservations & Passes</h2>
              <div style={{ fontSize: '0.825rem', color: 'var(--stone-600)' }}>
                Manage your confirmed bookings, download mobile passes, or request refunds.
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '28px' }}>
          {reservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--stone-600)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--stone-100)', color: 'var(--stone-400)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <CalendarCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--stone-900)', marginBottom: '6px' }}>No active reservations yet</h3>
              <p style={{ maxWidth: '420px', margin: '0 auto 20px auto', fontSize: '0.925rem' }}>
                Explore our hand-crafted slow expeditions and book your next serene sanctuary journey.
              </p>
              <button className="btn btn-sage-primary" onClick={onClose}>
                Browse Curated Journeys
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reservations.map((res) => {
                const isCancelled = res.status.includes('Cancelled');
                const totalDisplay = `${symbol}${Math.round((res.costBreakdown?.totalAmount || 0) * rate).toLocaleString()}`;

                return (
                  <div
                    key={res.id}
                    style={{
                      border: isCancelled ? '1px dashed var(--blush-border)' : '1.5px solid var(--blush-border)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isCancelled ? 'var(--blush-canvas)' : 'var(--blush-elevated)',
                      overflow: 'hidden',
                      boxShadow: isCancelled ? 'none' : 'var(--shadow-subtle)',
                      opacity: isCancelled ? 0.75 : 1,
                      transition: 'all 200ms ease'
                    }}
                  >
                    <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span className={`badge ${isCancelled ? 'badge-stone' : 'badge-sage'}`}>
                            {res.status}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--stone-500)', fontWeight: 600 }}>
                            REF: {res.reservationCode}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', color: 'var(--stone-900)', marginBottom: '8px' }}>
                          {res.adventureName}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--stone-700)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} style={{ color: 'var(--stone-500)' }} />
                            {res.date} • {res.slot}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Users size={14} style={{ color: 'var(--stone-500)' }} />
                            {res.traveler.guests} Guest(s) ({res.traveler.fullName})
                          </span>
                        </div>

                        {res.addOns && res.addOns.length > 0 && (
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--sage-800)' }}>
                            <strong>Add-ons:</strong> {res.addOns.map(a => a.name).join(', ')}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--stone-500)', textTransform: 'uppercase' }}>Total Paid</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: isCancelled ? 'var(--stone-500)' : 'var(--stone-900)' }}>
                            {totalDisplay}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!isCancelled && (
                            <button
                              className="btn btn-stone-outline btn-sm"
                              style={{ color: '#c53929', borderColor: '#e9b5af' }}
                              onClick={() => handleCancelBooking(res.id)}
                              disabled={cancellingId === res.id}
                              title="Cancel booking under 48h free cancellation"
                            >
                              <Ban size={13} />
                              <span>{cancellingId === res.id ? 'Cancelling...' : 'Cancel & Refund'}</span>
                            </button>
                          )}

                          <button
                            className="btn btn-stone-solid btn-sm"
                            onClick={() => window.print()}
                            title="Print boarding pass"
                          >
                            <Printer size={13} />
                            <span>Voucher</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
