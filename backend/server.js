import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { City } from './models/City.js';
import { Adventure } from './models/Adventure.js';
import { Reservation } from './models/Reservation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/qtrip';

app.use(cors());
app.use(express.json());

let isMongoConnected = false;

// Fallback JSON helpers
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { cities: [], adventures: [], reservations: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// Auto-seed MongoDB from db.json if collections are empty
async function seedMongoIfEmpty() {
  try {
    const citiesCount = await City.countDocuments();
    if (citiesCount === 0) {
      console.log('[MongoDB] Collections empty. Seeding initial data from db.json...');
      const seedData = readDB();
      if (seedData.cities && seedData.cities.length > 0) {
        await City.insertMany(seedData.cities);
      }
      if (seedData.adventures && seedData.adventures.length > 0) {
        await Adventure.insertMany(seedData.adventures);
      }
      if (seedData.reservations && seedData.reservations.length > 0) {
        await Reservation.insertMany(seedData.reservations);
      }
      console.log(`[MongoDB] Initial seed complete! Seeded ${seedData.cities.length} cities and ${seedData.adventures.length} adventures.`);
    }
  } catch (err) {
    console.error('[MongoDB] Seeding error:', err.message);
  }
}

// Connect to MongoDB
async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000
    });
    isMongoConnected = true;
    console.log(`[MongoDB] ✅ Successfully connected to ${MONGODB_URI}`);
    await seedMongoIfEmpty();
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[MongoDB] ⚠️ Could not connect to MongoDB (${err.message}). Using high-performance JSON fallback.`);
  }
}

connectMongoDB();

// Health check with DB status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isMongoConnected ? 'MongoDB (Mongoose)' : 'Structured JSON Storage',
    mongoConnected: isMongoConnected,
    timestamp: new Date().toISOString()
  });
});

// GET /api/cities - list all destinations with dynamic adventure counts
app.get('/api/cities', async (req, res) => {
  try {
    if (isMongoConnected) {
      const cities = await City.find({}).lean();
      const adventures = await Adventure.find({}, 'cityId').lean();
      const citiesWithCount = cities.map(city => {
        const count = adventures.filter(a => a.cityId === city.id).length;
        return { ...city, adventureCount: count };
      });
      return res.json(citiesWithCount);
    }
  } catch (err) {
    console.error('MongoDB cities error:', err);
  }

  // Fallback
  const db = readDB();
  const citiesWithCount = db.cities.map(city => {
    const count = db.adventures.filter(a => a.cityId === city.id).length;
    return { ...city, adventureCount: count };
  });
  res.json(citiesWithCount);
});

// POST /api/cities - add new destination dynamically
app.post('/api/cities', async (req, res) => {
  const { name, country, tagline, image } = req.body;
  if (!name || !country) {
    return res.status(400).json({ error: 'City name and country are required.' });
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCity = {
    id,
    name: name.trim(),
    country: country.trim(),
    tagline: tagline ? tagline.trim() : `Explore pristine experiences in ${name}`,
    image: image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80',
    adventureCount: 0,
    featured: false
  };

  try {
    if (isMongoConnected) {
      const existing = await City.findOne({ id });
      if (existing) {
        return res.status(409).json({ error: 'City already exists.' });
      }
      const created = await City.create(newCity);
      return res.status(201).json(created);
    }
  } catch (err) {
    console.error('MongoDB create city error:', err);
  }

  // Fallback
  const db = readDB();
  if (db.cities.some(c => c.id === id)) {
    return res.status(409).json({ error: 'City already exists.' });
  }
  db.cities.push(newCity);
  writeDB(db);
  res.status(201).json(newCity);
});

// GET /api/adventures - query with multi-faceted filtering
app.get('/api/adventures', async (req, res) => {
  const { city, category, search, maxPrice, maxDuration, sort } = req.query;

  try {
    if (isMongoConnected) {
      const filter = {};
      if (city && city !== 'all') {
        filter.cityId = new RegExp(`^${city}$`, 'i');
      }
      if (category && category !== 'all') {
        filter.category = new RegExp(`^${category}$`, 'i');
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        filter.costPerHead = { $lte: Number(maxPrice) };
      }
      if (maxDuration && !isNaN(Number(maxDuration))) {
        filter.duration = { $lte: Number(maxDuration) };
      }
      if (search && search.trim() !== '') {
        const queryRegex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { name: queryRegex },
          { cityName: queryRegex },
          { description: queryRegex },
          { category: queryRegex }
        ];
      }

      let sortOption = { reviewsCount: -1 };
      if (sort === 'price-asc') sortOption = { costPerHead: 1 };
      else if (sort === 'price-desc') sortOption = { costPerHead: -1 };
      else if (sort === 'rating-desc') sortOption = { rating: -1 };
      else if (sort === 'duration-asc') sortOption = { duration: 1 };

      const adventures = await Adventure.find(filter).sort(sortOption).lean();
      return res.json(adventures);
    }
  } catch (err) {
    console.error('MongoDB get adventures error:', err);
  }

  // Fallback
  const db = readDB();
  let results = [...db.adventures];

  if (city && city !== 'all') {
    results = results.filter(a => a.cityId.toLowerCase() === city.toLowerCase());
  }
  if (category && category !== 'all') {
    results = results.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    results = results.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.cityName.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  }
  if (maxPrice && !isNaN(Number(maxPrice))) {
    results = results.filter(a => a.costPerHead <= Number(maxPrice));
  }
  if (maxDuration && !isNaN(Number(maxDuration))) {
    results = results.filter(a => a.duration <= Number(maxDuration));
  }

  if (sort === 'price-asc') results.sort((a, b) => a.costPerHead - b.costPerHead);
  else if (sort === 'price-desc') results.sort((a, b) => b.costPerHead - a.costPerHead);
  else if (sort === 'rating-desc') results.sort((a, b) => b.rating - a.rating);
  else if (sort === 'duration-asc') results.sort((a, b) => a.duration - b.duration);
  else results.sort((a, b) => b.reviewsCount - a.reviewsCount);

  res.json(results);
});

// GET /api/adventures/:id - get single adventure
app.get('/api/adventures/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      const adv = await Adventure.findOne({ id: req.params.id }).lean();
      if (adv) return res.json(adv);
    }
  } catch (err) {
    console.error('MongoDB get adventure by id error:', err);
  }

  const db = readDB();
  const adventure = db.adventures.find(a => a.id === req.params.id);
  if (!adventure) return res.status(404).json({ error: 'Adventure not found.' });
  res.json(adventure);
});

// POST /api/adventures - add new adventure dynamically
app.post('/api/adventures', async (req, res) => {
  const {
    name,
    cityId,
    category,
    costPerHead,
    duration,
    description,
    image,
    groupSize
  } = req.body;

  if (!name || !cityId || !costPerHead || !duration) {
    return res.status(400).json({ error: 'Missing required adventure fields.' });
  }

  let city = null;
  if (isMongoConnected) {
    city = await City.findOne({ id: cityId }).lean();
  }
  if (!city) {
    const db = readDB();
    city = db.cities.find(c => c.id === cityId);
  }
  if (!city) {
    return res.status(400).json({ error: 'Invalid city selected.' });
  }

  const id = `adv-${cityId}-${Date.now().toString().slice(-4)}`;
  const newAdventure = {
    id,
    cityId,
    cityName: `${city.name}, ${city.country}`,
    name: name.trim(),
    category: category || 'Adventure & Hiking',
    costPerHead: Number(costPerHead),
    currency: 'USD',
    duration: Number(duration),
    durationUnit: 'Hours',
    rating: 5.0,
    reviewsCount: 1,
    groupSize: groupSize || 'Small Group (Max 8)',
    image: image || city.image,
    gallery: [
      image || city.image,
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
    ],
    description: description ? description.trim() : 'Bespoke hand-crafted travel experience.',
    highlights: [
      'Certified local expert guide',
      'Intimate small group experience',
      'All local permits and entries included',
      'Curated scenic viewpoints'
    ],
    inclusions: [
      'Expert bilingual leader',
      'Safety equipment & water',
      'Local artisan tasting'
    ],
    exclusions: [
      'Personal transport to meeting hub',
      'Gratuities'
    ],
    itinerary: [
      { time: '09:00 AM', title: 'Welcome & Briefing', detail: 'Meet your guide and review route.' },
      { time: '11:00 AM', title: 'Main Expedition', detail: 'Guided excursion through scenic landmarks.' },
      { time: '01:00 PM', title: 'Local Tasting & Conclusion', detail: 'Conclude with refreshing local beverage.' }
    ],
    meetingPoint: `${city.name} Central Historic Square`,
    availableSlots: ['09:00 AM', '02:00 PM'],
    freeCancellationHours: 48
  };

  try {
    if (isMongoConnected) {
      const created = await Adventure.create(newAdventure);
      return res.status(201).json(created);
    }
  } catch (err) {
    console.error('MongoDB create adventure error:', err);
  }

  const db = readDB();
  db.adventures.push(newAdventure);
  writeDB(db);
  res.status(201).json(newAdventure);
});

// GET /api/reservations - list all bookings
app.get('/api/reservations', async (req, res) => {
  try {
    if (isMongoConnected) {
      const reservations = await Reservation.find({}).sort({ createdAt: -1 }).lean();
      return res.json(reservations);
    }
  } catch (err) {
    console.error('MongoDB get reservations error:', err);
  }

  const db = readDB();
  res.json(db.reservations || []);
});

// POST /api/reservations - create a new booking with real-time cost calculation & validation
app.post('/api/reservations', async (req, res) => {
  const {
    adventureId,
    date,
    slot,
    traveler,
    selectedAddOns,
    couponCode
  } = req.body;

  // Validation
  const errors = {};
  if (!adventureId) errors.adventure = 'Adventure ID is required.';
  if (!date) errors.date = 'Reservation date is required.';
  if (!slot) errors.slot = 'Time slot is required.';

  if (!traveler) {
    errors.traveler = 'Traveler details are required.';
  } else {
    if (!traveler.fullName || traveler.fullName.trim().length < 3) {
      errors.fullName = 'Full legal name is required (at least 3 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!traveler.email || !emailRegex.test(traveler.email)) {
      errors.email = 'A valid email address is required.';
    }
    if (!traveler.phone || traveler.phone.trim().length < 7) {
      errors.phone = 'Valid phone number is required.';
    }
    const adults = Number(traveler.adults || traveler.guests || 1);
    if (adults < 1) {
      errors.guests = 'At least 1 adult traveler is required.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  let adventure = null;
  if (isMongoConnected) {
    adventure = await Adventure.findOne({ id: adventureId }).lean();
  }
  if (!adventure) {
    const db = readDB();
    adventure = db.adventures.find(a => a.id === adventureId);
  }
  if (!adventure) {
    return res.status(404).json({ error: 'Adventure not found.' });
  }

  // Cost calculation
  const adults = Number(traveler.adults || 1);
  const children = Number(traveler.children || 0);
  const totalGuests = adults + children;
  
  const baseTotal = (adults * adventure.costPerHead) + (children * Math.round(adventure.costPerHead * 0.75));

  let addOnsTotal = 0;
  const processedAddOns = [];
  if (Array.isArray(selectedAddOns)) {
    selectedAddOns.forEach(addon => {
      const price = Number(addon.price || 0);
      addOnsTotal += price;
      processedAddOns.push({ name: addon.name, price });
    });
  }

  const serviceFee = Math.round((baseTotal + addOnsTotal) * 0.05);

  let discount = 0;
  if (couponCode) {
    const cleanCoupon = couponCode.trim().toUpperCase();
    if (cleanCoupon === 'SAGE10') {
      discount = Math.round((baseTotal + addOnsTotal) * 0.10);
    } else if (cleanCoupon === 'EARLYBIRD') {
      discount = 20;
    }
  }

  const totalAmount = Math.max(0, baseTotal + addOnsTotal + serviceFee - discount);

  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const randomChar = chars[Math.floor(Math.random() * chars.length)];
  const reservationCode = `QT-${randomNum}-${randomChar}`;

  const reservation = {
    id: `res-${Date.now()}`,
    reservationCode,
    adventureId: adventure.id,
    adventureName: adventure.name,
    cityName: adventure.cityName,
    date,
    slot,
    traveler: {
      fullName: traveler.fullName.trim(),
      email: traveler.email.trim().toLowerCase(),
      phone: traveler.phone.trim(),
      guests: totalGuests,
      adults,
      children,
      specialRequests: traveler.specialRequests ? traveler.specialRequests.trim() : 'None'
    },
    addOns: processedAddOns,
    costBreakdown: {
      costPerHead: adventure.costPerHead,
      adults,
      children,
      guestsCount: totalGuests,
      baseTotal,
      addOnsTotal,
      serviceFee,
      discount,
      totalAmount,
      currency: adventure.currency || 'USD'
    },
    status: 'Confirmed',
    createdAt: new Date()
  };

  try {
    if (isMongoConnected) {
      const created = await Reservation.create(reservation);
      return res.status(201).json(created);
    }
  } catch (err) {
    console.error('MongoDB create reservation error:', err);
  }

  const db = readDB();
  db.reservations.unshift(reservation);
  writeDB(db);
  res.status(201).json(reservation);
});

// DELETE /api/reservations/:id - cancel a booking with refund calculation
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      const updated = await Reservation.findOneAndUpdate(
        { id: req.params.id },
        { status: 'Cancelled / Refunded', cancelledAt: new Date() },
        { new: true }
      );
      if (updated) {
        return res.json({
          message: 'Reservation successfully cancelled. Full refund will appear on original payment method in 3-5 business days.',
          reservation: updated
        });
      }
    }
  } catch (err) {
    console.error('MongoDB cancel reservation error:', err);
  }

  const db = readDB();
  const index = db.reservations.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Reservation not found.' });
  }

  db.reservations[index].status = 'Cancelled / Refunded';
  db.reservations[index].cancelledAt = new Date().toISOString();
  writeDB(db);

  res.json({
    message: 'Reservation successfully cancelled. Full refund will appear on original payment method in 3-5 business days.',
    reservation: db.reservations[index]
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[QTrip MERN Backend] Server running on http://localhost:${PORT}`);
  });
}

export default app;
