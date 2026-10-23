import React, { useState } from 'react';
import { X, Star, Clock, Users, ShieldCheck, MapPin, Check, Minus, Calendar, ArrowRight } from 'lucide-react';

export default function AdventureDetailModal({
  adventure,
  currency,
  exchangeRates,
  onClose,
  onOpenBooking
}) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!adventure) return null;

  const rate = exchangeRates[currency] || 1;
  const convertedPrice = Math.round(adventure.costPerHead * rate);
  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };
  const symbol = currencySymbols[currency] || '$';

  const photos = adventure.gallery && adventure.gallery.length > 0
    ? adventure.gallery
    : [adventure.image];

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Gallery Section */}
        <div style={{ position: 'relative', width: '100%', height: '380px', backgroundColor: 'var(--stone-200)', overflow: 'hidden' }}>
          <img
            src={photos[selectedPhotoIndex]}
            alt={adventure.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 200ms ease' }}
          />

          {/* Photo Switcher Thumbnails */}
          {photos.length > 1 && (
            <div style={{ position: 'absolute', bottom: '16px', left: '20px', display: 'flex', gap: '8px', zIndex: 5 }}>
              {photos.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  style={{
                    width: '54px',
                    height: '42px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: selectedPhotoIndex === idx ? '2px solid #ffffff' : '1.5px solid rgba(255,255,255,0.6)',
                    padding: 0,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '8px' }}>
            <span className="badge badge-sage" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
              {adventure.category}
            </span>
            <span className="badge" style={{ backgroundColor: 'rgba(31,33,29,0.8)', color: '#ffffff', backdropFilter: 'blur(4px)' }}>
              <ShieldCheck size={13} style={{ color: 'var(--sage-200)' }} />
              {adventure.freeCancellationHours}h Free Cancellation
            </span>
          </div>
        </div>

        {/* Modal Content Body */}
        <div style={{ padding: '32px' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--sage-700)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                <MapPin size={15} />
                <span>{adventure.cityName}</span>
              </div>
              <h2 style={{ fontSize: '2.1rem', marginBottom: '12px' }}>
                {adventure.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--stone-700)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--stone-900)' }}>
                  <Star size={16} className="star-icon" />
                  {adventure.rating.toFixed(2)}
                  <span style={{ fontWeight: 400, color: 'var(--stone-500)' }}>({adventure.reviewsCount} verified reviews)</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={16} style={{ color: 'var(--stone-500)' }} />
                  {adventure.duration} {adventure.durationUnit}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Users size={16} style={{ color: 'var(--stone-500)' }} />
                  {adventure.groupSize}
                </span>
              </div>
            </div>

            {/* Price Callout & Action */}
            <div style={{ backgroundColor: 'var(--blush-elevated)', border: '1.5px solid var(--blush-border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', textAlign: 'right', minWidth: '220px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Standard Rate
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--stone-900)', fontFamily: 'var(--font-ui)', margin: '4px 0 12px 0' }}>
                {symbol}{convertedPrice.toLocaleString()}
                <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--stone-500)' }}> / person</span>
              </div>
              <button
                className="btn btn-sage-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  onClose();
                  onOpenBooking(adventure);
                }}
              >
                <Calendar size={16} />
                <span>Book This Journey</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div style={{ borderTop: '1px solid var(--blush-border)', paddingTop: '24px', marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Overview</h3>
            <p style={{ fontSize: '1.025rem', lineHeight: '1.7', color: 'var(--stone-800)' }}>
              {adventure.description}
            </p>
          </div>

          {/* Inclusions and Exclusions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', backgroundColor: 'var(--blush-elevated)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--blush-border)', marginBottom: '28px' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--sage-800)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={18} style={{ color: 'var(--sage-700)' }} />
                <span>What is Included</span>
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {adventure.inclusions.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: 'var(--stone-800)' }}>
                    <span style={{ color: 'var(--sage-600)', marginTop: '2px' }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--stone-700)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Minus size={18} style={{ color: 'var(--stone-500)' }} />
                <span>What is Not Included</span>
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {adventure.exclusions.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: 'var(--stone-600)' }}>
                    <span style={{ color: 'var(--stone-400)', marginTop: '2px' }}>✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Itinerary Timeline */}
          {adventure.itinerary && adventure.itinerary.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Expedition Itinerary</h3>
              <div style={{ borderLeft: '2px solid var(--sage-300)', paddingLeft: '20px', marginLeft: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {adventure.itinerary.map((step, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-27px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--sage-700)', border: '2px solid #ffffff' }}></div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sage-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {step.time}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--stone-900)', margin: '2px 0 4px 0' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--stone-600)' }}>
                      {step.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Point Box */}
          <div style={{ backgroundColor: 'var(--blush-elevated)', border: '1px solid var(--blush-border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--sage-100)', color: 'var(--sage-800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--sage-700)', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Meeting Point Location
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--stone-900)' }}>
                  {adventure.meetingPoint}
                </div>
              </div>
            </div>
            <button
              className="btn btn-sage-primary btn-sm"
              onClick={() => {
                onClose();
                onOpenBooking(adventure);
              }}
            >
              <span>Reserve Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
