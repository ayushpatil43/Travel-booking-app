import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

export default function CityGrid({ cities, selectedCity, onSelectCity }) {
  return (
    <section className="section-container">
      <div className="section-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--sage-700)', fontSize: '0.825rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            <MapPin size={15} />
            <span>Curated Destinations</span>
          </div>
          <h2 className="section-title">Explore by Sanctuary & Region</h2>
          <p className="section-desc">Select a region to view handcrafted itineraries and local excursions.</p>
        </div>
        
        {selectedCity !== 'all' && (
          <button
            className="btn btn-stone-solid btn-sm"
            onClick={() => onSelectCity('all')}
          >
            Show All Destinations
          </button>
        )}
      </div>

      <div className="cities-grid">
        {cities.map((city) => {
          const isActive = selectedCity === city.id;
          return (
            <div
              key={city.id}
              className={`city-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCity(isActive ? 'all' : city.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectCity(isActive ? 'all' : city.id);
                }
              }}
            >
              <img
                src={city.image}
                alt={city.name}
                className="city-card-img"
                loading="lazy"
              />
              <div className="city-card-gradient"></div>
              <div className="city-card-content">
                <h3 className="city-name">{city.name}</h3>
                <div className="city-meta">
                  <span>{city.country}</span>
                  <span className="badge badge-sage" style={{ fontSize: '0.7rem' }}>
                    {city.adventureCount} {city.adventureCount === 1 ? 'Exp' : 'Exps'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
