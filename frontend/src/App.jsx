import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CityGrid from './components/CityGrid';
import FilterToolbar from './components/FilterToolbar';
import AdventureCard from './components/AdventureCard';
import AdventureDetailModal from './components/AdventureDetailModal';
import ReservationDrawer from './components/ReservationDrawer';
import MyBookingsModal from './components/MyBookingsModal';
import AddExperienceModal from './components/AddExperienceModal';
import Toast from './components/Toast';
import { api } from './services/api';
import { Compass, Sparkles, Shield, HeartHandshake, Mail, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  JPY: 152.0
};

export default function App() {
  const [cities, setCities] = useState([]);
  const [adventures, setAdventures] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(300);
  const [sortBy, setSortBy] = useState('popularity');

  // Currency
  const [currency, setCurrency] = useState('USD');

  // Modals & Drawers
  const [detailAdventure, setDetailAdventure] = useState(null);
  const [bookingAdventure, setBookingAdventure] = useState(null);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetching from Express REST API
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [citiesData, adventuresData, reservationsData] = await Promise.all([
          api.getCities(),
          api.getAdventures(),
          api.getReservations()
        ]);
        setCities(citiesData);
        setAdventures(adventuresData);
        setReservations(reservationsData);
      } catch (err) {
        console.error('Failed to load data from backend:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Filtered & Sorted Adventures
  const filteredAdventures = useMemo(() => {
    return adventures.filter((adv) => {
      // City filter
      if (selectedCity !== 'all' && adv.cityId.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && adv.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Price filter
      if (adv.costPerHead > maxPrice) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = adv.name.toLowerCase().includes(q);
        const matchesCity = adv.cityName.toLowerCase().includes(q);
        const matchesDesc = adv.description.toLowerCase().includes(q);
        const matchesCategory = adv.category.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesDesc && !matchesCategory) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.costPerHead - b.costPerHead;
      if (sortBy === 'price-desc') return b.costPerHead - a.costPerHead;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'duration-asc') return a.duration - b.duration;
      return b.reviewsCount - a.reviewsCount; // default popularity
    });
  }, [adventures, selectedCity, selectedCategory, searchQuery, maxPrice, sortBy]);

  // Handlers
  const handleCitySelect = (cityId) => {
    setSelectedCity(cityId);
    // Smooth scroll to adventure catalog
    const catalogEl = document.getElementById('adventures-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickSelectCity = (cityName) => {
    const found = cities.find(c => c.name.toLowerCase().includes(cityName.toLowerCase()));
    if (found) {
      handleCitySelect(found.id);
    } else {
      setSearchQuery(cityName);
      const catalogEl = document.getElementById('adventures-catalog');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSelectedCity('all');
    setSelectedCategory('all');
    setSearchQuery('');
    setMaxPrice(350);
    setSortBy('popularity');
  };

  const handleReservationSuccess = (newRes) => {
    setReservations((prev) => [newRes, ...prev]);
    // Refresh city adventure counts if needed
    addToast(`Reservation ${newRes.reservationCode} confirmed! A voucher was generated.`);
  };

  const handleReservationCancelled = (cancelledRes) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === cancelledRes.id ? cancelledRes : r))
    );
    addToast('Reservation successfully cancelled and refund initiated.', 'info');
  };

  const handleCityCreated = (newCity) => {
    setCities((prev) => [...prev, newCity]);
    addToast(`New destination "${newCity.name}" created! UI dynamically updated.`);
  };

  const handleAdventureCreated = (newAdv) => {
    setAdventures((prev) => [newAdv, ...prev]);
    // Update destination count dynamically
    setCities((prev) =>
      prev.map((c) =>
        c.id === newAdv.cityId ? { ...c, adventureCount: (c.adventureCount || 0) + 1 } : c
      )
    );
    addToast(`Experience "${newAdv.name}" published dynamically!`);
  };

  const hasActiveFilters =
    selectedCity !== 'all' ||
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    maxPrice < 350;

  return (
    <div className="app-wrapper">
      {/* Navigation */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        reservationsCount={reservations.filter((r) => !r.status.includes('Cancelled')).length}
        onOpenBookings={() => setIsBookingsOpen(true)}
        onOpenAddModal={() => setIsAddOpen(true)}
      />

      {/* Hero Header */}
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onQuickSelectCity={handleQuickSelectCity}
      />

      {/* Destination Regions Grid */}
      <CityGrid
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={handleCitySelect}
      />

      {/* Catalog & Filter Section */}
      <section className="section-container">
        <FilterToolbar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          totalResults={filteredAdventures.length}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Adventures Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--stone-600)' }}>
            <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-editorial)' }}>
              Gathering slow expeditions...
            </div>
          </div>
        ) : filteredAdventures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', backgroundColor: 'var(--blush-surface)', borderRadius: 'var(--radius-lg)', border: '1.5px dashed var(--blush-border)' }}>
            <Compass size={40} style={{ color: 'var(--sage-500)', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>No matching journeys found</h3>
            <p style={{ maxWidth: '420px', margin: '0 auto 18px auto', color: 'var(--stone-600)' }}>
              Try adjusting your maximum price slider, resetting category filters, or selecting a different region.
            </p>
            <button className="btn btn-sage-primary" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="adventures-grid">
            {filteredAdventures.map((adv) => (
              <AdventureCard
                key={adv.id}
                adventure={adv}
                currency={currency}
                exchangeRates={EXCHANGE_RATES}
                onSelectAdventure={setDetailAdventure}
                onOpenBooking={setBookingAdventure}
              />
            ))}
          </div>
        )}
      </section>

      {/* Editorial Slow Travel Philosophy Banner */}
      <section className="section-container">
        <div style={{ backgroundColor: 'var(--blush-surface)', border: '1px solid var(--blush-border)', borderRadius: 'var(--radius-xl)', padding: '48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--sage-700)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Our Stewardship Charter
            </span>
            <h2 style={{ fontSize: '2.1rem', margin: '6px 0 16px 0' }}>
              Travel that honors the silence and stone.
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--stone-700)', marginBottom: '20px' }}>
              Every expedition hosted on QTrip is vetted against regenerative tourism principles.
              We restrict our groups to 8–10 conscious guests, ensuring historic shrines,
              coastal paths, and alpine refugios remain undisturbed for generations to come.
            </p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--stone-900)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--sage-700)' }} />
                <span>Zero Carbon Footprint Option</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--stone-900)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--sage-700)' }} />
                <span>100% Fair Host Honorarium</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--blush-elevated)', borderRadius: 'var(--radius-lg)', padding: '28px', border: '1px solid var(--blush-border)', boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>
              The Sanctuary Gazette
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--stone-600)', marginBottom: '18px' }}>
              Receive monthly musings on remote mountain paths, artisan workshops, and seasonal departures.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Enter your email..."
                className="input-field"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-sage-primary"
                onClick={() => addToast('Thank you for subscribing to The Sanctuary Gazette!')}
              >
                <span>Subscribe</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--blush-border)', backgroundColor: 'var(--blush-surface)', padding: '48px 24px 32px 24px', marginTop: '40px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div className="brand-icon">
                <Compass size={20} />
              </div>
              <span className="brand-title">QTrip</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--stone-600)', maxWidth: '320px', lineHeight: '1.6' }}>
              Handcrafted travel and activity booking platform. Designed with organic sage green and olive stone aesthetics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--stone-900)', letterSpacing: '0.04em', marginBottom: '12px' }}>
                Destinations
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--stone-600)' }}>
                <li><a href="#kyoto" onClick={(e) => { e.preventDefault(); handleCitySelect('kyoto'); }}>Kyoto, Japan</a></li>
                <li><a href="#amalfi" onClick={(e) => { e.preventDefault(); handleCitySelect('amalfi'); }}>Amalfi Coast, Italy</a></li>
                <li><a href="#swiss" onClick={(e) => { e.preventDefault(); handleCitySelect('swiss-alps'); }}>Zermatt, Switzerland</a></li>
                <li><a href="#bali" onClick={(e) => { e.preventDefault(); handleCitySelect('bali'); }}>Ubud, Bali</a></li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--stone-900)', letterSpacing: '0.04em', marginBottom: '12px' }}>
                Platform
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--stone-600)' }}>
                <li><a href="#bookings" onClick={(e) => { e.preventDefault(); setIsBookingsOpen(true); }}>My Reservations</a></li>
                <li><a href="#list" onClick={(e) => { e.preventDefault(); setIsAddOpen(true); }}>List Experience</a></li>
                <li><a href="#guarantee" onClick={(e) => { e.preventDefault(); addToast('48h Free Cancellation Policy is active on all trips'); }}>48h Guarantee</a></li>
                <li><a href="#api" onClick={(e) => { e.preventDefault(); addToast('MERN Stack REST API online on port 5000'); }}>RESTful API Status</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1240px', margin: '32px auto 0 auto', paddingTop: '24px', borderTop: '1px solid var(--stone-150)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: 'var(--stone-500)' }}>
          <div>© {new Date().getFullYear()} QTrip Platform. Full-Stack MERN Architecture.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Sage Green & Olive Stone Design System</span>
            <span>•</span>
            <span>Real-Time Cost Calculation</span>
            <span>•</span>
            <span>Dynamic Component Generation</span>
          </div>
        </div>
      </footer>

      {/* Adventure Detail Modal */}
      {detailAdventure && (
        <AdventureDetailModal
          adventure={detailAdventure}
          currency={currency}
          exchangeRates={EXCHANGE_RATES}
          onClose={() => setDetailAdventure(null)}
          onOpenBooking={(adv) => setBookingAdventure(adv)}
        />
      )}

      {/* Reservation Drawer / Modal */}
      {bookingAdventure && (
        <ReservationDrawer
          adventure={bookingAdventure}
          currency={currency}
          exchangeRates={EXCHANGE_RATES}
          onClose={() => setBookingAdventure(null)}
          onReservationSuccess={handleReservationSuccess}
        />
      )}

      {/* My Bookings Manager Modal */}
      {isBookingsOpen && (
        <MyBookingsModal
          reservations={reservations}
          currency={currency}
          exchangeRates={EXCHANGE_RATES}
          onClose={() => setIsBookingsOpen(false)}
          onReservationCancelled={handleReservationCancelled}
        />
      )}

      {/* Add Destination / Experience Modal */}
      {isAddOpen && (
        <AddExperienceModal
          cities={cities}
          onClose={() => setIsAddOpen(false)}
          onCityCreated={handleCityCreated}
          onAdventureCreated={handleAdventureCreated}
        />
      )}

      {/* Toast Feedback */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
