import React, { useState } from 'react';
import { X, Plus, Sparkles, MapPin, Compass, Image as ImageIcon, Check } from 'lucide-react';
import { api } from '../services/api';

export default function AddExperienceModal({
  cities,
  onClose,
  onCityCreated,
  onAdventureCreated
}) {
  const [tab, setTab] = useState('adventure'); // 'adventure' or 'city'

  // Adventure Form State
  const [advName, setAdvName] = useState('');
  const [advCityId, setAdvCityId] = useState(cities[0]?.id || 'kyoto');
  const [advCategory, setAdvCategory] = useState('Adventure & Hiking');
  const [advCost, setAdvCost] = useState(135);
  const [advDuration, setAdvDuration] = useState(5);
  const [advDesc, setAdvDesc] = useState('');
  const [advImage, setAdvImage] = useState('');

  // City Form State
  const [cityName, setCityName] = useState('');
  const [country, setCountry] = useState('');
  const [tagline, setTagline] = useState('');
  const [cityImage, setCityImage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Quick Preset Helper for quick demonstration
  const handleLoadAdventurePreset = () => {
    setAdvName('Reykjavik Geothermal Hot Springs & Highland Fjord Trek');
    setAdvCategory('Adventure & Hiking');
    setAdvCost(175);
    setAdvDuration(6);
    setAdvDesc('Hike through otherworldly volcanic basalt valleys, bathe in secluded natural hot springs, and witness steaming geothermal geysers in Iceland’s wild southern highlands.');
    setAdvImage('https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=900&q=80');
  };

  const handleLoadCityPreset = () => {
    setCityName('Reykjavik');
    setCountry('Iceland');
    setTagline('Volcanic Fjords & Midnight Aurora');
    setCityImage('https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=900&q=80');
  };

  const handleSubmitCity = async (e) => {
    e.preventDefault();
    if (!cityName || !country) {
      setError('City name and country are required.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const newCity = await api.createCity({
        name: cityName,
        country,
        tagline,
        image: cityImage
      });
      if (onCityCreated) onCityCreated(newCity);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create city');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAdventure = async (e) => {
    e.preventDefault();
    if (!advName || !advCityId || !advCost || !advDuration) {
      setError('Please fill in all required experience fields.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const newAdv = await api.createAdventure({
        name: advName,
        cityId: advCityId,
        category: advCategory,
        costPerHead: advCost,
        duration: advDuration,
        description: advDesc,
        image: advImage
      });
      if (onAdventureCreated) onAdventureCreated(newAdv);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create adventure');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px', borderBottom: '1px solid var(--stone-200)', backgroundColor: 'var(--stone-50)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--sage-700)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Sparkles size={14} />
              <span>Dynamic Component Generation</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', marginTop: '2px' }}>
              Add Sanctuary or Activity
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--blush-border)', backgroundColor: 'var(--blush-surface)' }}>
          <button
            type="button"
            onClick={() => setTab('adventure')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: 'transparent',
              borderBottom: tab === 'adventure' ? '3px solid var(--sage-700)' : '3px solid transparent',
              color: tab === 'adventure' ? 'var(--sage-900)' : 'var(--stone-500)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Add New Activity / Expedition
          </button>
          <button
            type="button"
            onClick={() => setTab('city')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: 'transparent',
              borderBottom: tab === 'city' ? '3px solid var(--sage-700)' : '3px solid transparent',
              color: tab === 'city' ? 'var(--sage-900)' : 'var(--stone-500)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Add New Destination Region
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px' }}>
          {error && (
            <div style={{ backgroundColor: '#fff3f2', border: '1px solid #f5c2bd', color: '#c53929', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '18px' }}>
              {error}
            </div>
          )}

          {/* TAB 1: ADD ADVENTURE */}
          {tab === 'adventure' && (
            <form onSubmit={handleSubmitAdventure}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleLoadAdventurePreset}
                  style={{ color: 'var(--sage-700)', fontSize: '0.78rem' }}
                >
                  ⚡ Fill Sample Icelandic Expedition
                </button>
              </div>

              <div className="input-group">
                <label className="input-label">Experience Title *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Hidden Shinto Shrine Meditation & Cedar Forest Trail"
                  value={advName}
                  onChange={(e) => setAdvName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Destination Region *</label>
                  <select
                    className="input-field"
                    value={advCityId}
                    onChange={(e) => setAdvCityId(e.target.value)}
                  >
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}, {c.country}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Category *</label>
                  <select
                    className="input-field"
                    value={advCategory}
                    onChange={(e) => setAdvCategory(e.target.value)}
                  >
                    <option value="Cultural & Heritage">Cultural & Heritage</option>
                    <option value="Adventure & Hiking">Adventure & Hiking</option>
                    <option value="Water & Coast">Water & Coast</option>
                    <option value="Wellness & Nature">Wellness & Nature</option>
                    <option value="Wildlife & Eco">Wildlife & Eco</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Price per Guest (USD) *</label>
                  <input
                    type="number"
                    min="20"
                    max="1000"
                    className="input-field"
                    value={advCost}
                    onChange={(e) => setAdvCost(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Duration (Hours) *</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    className="input-field"
                    value={advDuration}
                    onChange={(e) => setAdvDuration(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Cover Image URL (optional)</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={advImage}
                  onChange={(e) => setAdvImage(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Editorial Description</label>
                <textarea
                  rows="3"
                  className="input-field"
                  placeholder="Describe the tranquil ambiance, terrain, and sensory journey..."
                  value={advDesc}
                  onChange={(e) => setAdvDesc(e.target.value)}
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-stone-outline" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sage-primary"
                  disabled={isSubmitting}
                >
                  <Plus size={16} />
                  <span>{isSubmitting ? 'Generating UI Element...' : 'Publish Experience'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ADD CITY */}
          {tab === 'city' && (
            <form onSubmit={handleSubmitCity}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleLoadCityPreset}
                  style={{ color: 'var(--sage-700)', fontSize: '0.78rem' }}
                >
                  ⚡ Fill Sample Destination (Reykjavik)
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">City / Region Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Provence"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Country *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. France"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Editorial Tagline</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Lavender Plateaus & Stone Bastides"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Destination Photo URL</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://images.unsplash.com/..."
                  value={cityImage}
                  onChange={(e) => setCityImage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-stone-outline" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sage-primary"
                  disabled={isSubmitting}
                >
                  <Plus size={16} />
                  <span>{isSubmitting ? 'Creating Destination...' : 'Add Destination Region'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
