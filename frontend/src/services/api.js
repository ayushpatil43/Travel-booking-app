const API_BASE = '/api';

export const api = {
  // Cities
  async getCities() {
    const res = await fetch(`${API_BASE}/cities`);
    if (!res.ok) throw new Error('Failed to fetch cities');
    return res.json();
  },

  async createCity(cityData) {
    const res = await fetch(`${API_BASE}/cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cityData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create city');
    }
    return res.json();
  },

  // Adventures
  async getAdventures(params = {}) {
    const query = new URLSearchParams();
    if (params.city && params.city !== 'all') query.append('city', params.city);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.maxDuration) query.append('maxDuration', params.maxDuration);
    if (params.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/adventures?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch adventures');
    return res.json();
  },

  async getAdventureById(id) {
    const res = await fetch(`${API_BASE}/adventures/${id}`);
    if (!res.ok) throw new Error('Failed to fetch adventure detail');
    return res.json();
  },

  async createAdventure(adventureData) {
    const res = await fetch(`${API_BASE}/adventures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adventureData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create adventure');
    }
    return res.json();
  },

  // Reservations
  async getReservations() {
    const res = await fetch(`${API_BASE}/reservations`);
    if (!res.ok) throw new Error('Failed to fetch reservations');
    return res.json();
  },

  async createReservation(reservationData) {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw err;
    }
    return res.json();
  },

  async cancelReservation(id) {
    const res = await fetch(`${API_BASE}/reservations/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to cancel reservation');
    return res.json();
  }
};
