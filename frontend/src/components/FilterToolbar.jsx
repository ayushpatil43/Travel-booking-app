import React from 'react';
import { SlidersHorizontal, ArrowUpDown, X, Sparkles, Mountain, Landmark, Waves, HeartHandshake, Compass } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Experiences', icon: Compass },
  { id: 'Cultural & Heritage', label: 'Cultural & Heritage', icon: Landmark },
  { id: 'Adventure & Hiking', label: 'Adventure & Hiking', icon: Mountain },
  { id: 'Water & Coast', label: 'Water & Coast', icon: Waves },
  { id: 'Wellness & Nature', label: 'Wellness & Nature', icon: HeartHandshake },
  { id: 'Wildlife & Eco', label: 'Wildlife & Eco', icon: Sparkles }
];

export default function FilterToolbar({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  maxPrice,
  onMaxPriceChange,
  totalResults,
  onResetFilters,
  hasActiveFilters
}) {
  return (
    <div className="filter-toolbar" id="adventures-catalog">
      {/* Category Pills Row */}
      <div className="filter-row-top">
        <div className="category-chips">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`chip-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Clear Filters if active */}
        {hasActiveFilters && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={onResetFilters}
            style={{ color: 'var(--terracotta)', fontWeight: 600 }}
          >
            <X size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Second Row: Refinement Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', paddingTop: '10px', borderTop: '1px solid var(--stone-150)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--stone-700)' }}>
          <SlidersHorizontal size={15} style={{ color: 'var(--sage-700)' }} />
          <span>Showing <strong style={{ color: 'var(--stone-900)' }}>{totalResults}</strong> handcrafted experiences</span>
        </div>

        <div className="filter-controls-group">
          {/* Max Price Slider Control */}
          <div className="control-item" style={{ minWidth: '200px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--stone-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Max: ${maxPrice}
            </span>
            <input
              type="range"
              min="50"
              max="350"
              step="10"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: 'var(--sage-700)',
                cursor: 'pointer'
              }}
              aria-label="Filter by maximum price"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="control-item">
            <ArrowUpDown size={14} style={{ color: 'var(--stone-500)' }} />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort experiences"
            >
              <option value="popularity">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="duration-asc">Duration: Shortest First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
