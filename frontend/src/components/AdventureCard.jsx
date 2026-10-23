import React, { useState } from 'react';
import { Star, Clock, MapPin, Heart, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function AdventureCard({
  adventure,
  currency,
  exchangeRates,
  onSelectAdventure,
  onOpenBooking
}) {
  const [isSaved, setIsSaved] = useState(false);

  // Currency calculation
  const rate = exchangeRates[currency] || 1;
  const convertedPrice = Math.round(adventure.costPerHead * rate);

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥'
  };
  const symbol = currencySymbols[currency] || '$';

  return (
    <article className="adventure-card">
      {/* Media Header */}
      <div className="card-img-wrapper">
        <img
          src={adventure.image}
          alt={adventure.name}
          className="card-img"
          loading="lazy"
        />

        <div className="card-category-tag">
          <span className="badge badge-sage">
            {adventure.category}
          </span>
        </div>

        <div className="card-duration-badge">
          <Clock size={13} />
          <span>{adventure.duration} {adventure.durationUnit}</span>
        </div>

        <button
          className="card-save-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart
            size={18}
            fill={isSaved ? 'var(--terracotta)' : 'none'}
            color={isSaved ? 'var(--terracotta)' : 'currentColor'}
          />
        </button>
      </div>

      {/* Content Body */}
      <div className="card-body">
        <div className="card-location">
          <MapPin size={13} />
          <span>{adventure.cityName}</span>
        </div>

        <h3 className="card-title" title={adventure.name}>
          {adventure.name}
        </h3>

        <p className="card-description">
          {adventure.description}
        </p>

        {/* Highlight Pills */}
        <div className="card-highlights">
          {adventure.highlights.slice(0, 2).map((h, idx) => (
            <span key={idx} className="highlight-pill">
              <CheckCircle2 size={11} style={{ display: 'inline', marginRight: '3px', color: 'var(--sage-600)' }} />
              {h}
            </span>
          ))}
        </div>

        {/* Footer & Actions */}
        <div className="card-footer">
          <div className="card-price-block">
            <span className="price-label">From</span>
            <div>
              <span className="price-value">{symbol}{convertedPrice.toLocaleString()}</span>
              <span className="price-unit"> / guest</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div className="card-rating-block">
              <Star size={14} className="star-icon" />
              <span>{adventure.rating.toFixed(2)}</span>
              <span style={{ color: 'var(--stone-500)', fontSize: '0.8rem', fontWeight: '400' }}>
                ({adventure.reviewsCount})
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn btn-stone-outline btn-sm"
                onClick={() => onSelectAdventure(adventure)}
                title="View full itinerary, guide info and gallery"
              >
                <span>Details</span>
              </button>

              <button
                className="btn btn-sage-primary btn-sm"
                onClick={() => onOpenBooking(adventure)}
              >
                <span>Book</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
