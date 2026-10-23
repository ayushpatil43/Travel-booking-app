import mongoose from 'mongoose';

const travelerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  guests: { type: Number, required: true, default: 1 },
  adults: { type: Number, default: 1 },
  children: { type: Number, default: 0 },
  specialRequests: { type: String, default: 'None' }
}, { _id: false });

const addOnSchema = new mongoose.Schema({
  name: String,
  price: Number
}, { _id: false });

const costBreakdownSchema = new mongoose.Schema({
  costPerHead: Number,
  adults: Number,
  children: Number,
  guestsCount: Number,
  baseTotal: Number,
  addOnsTotal: Number,
  serviceFee: Number,
  discount: Number,
  totalAmount: Number,
  currency: { type: String, default: 'USD' }
}, { _id: false });

const reservationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  reservationCode: { type: String, required: true, unique: true, index: true },
  adventureId: { type: String, required: true },
  adventureName: { type: String, required: true },
  cityName: { type: String, required: true },
  date: { type: String, required: true },
  slot: { type: String, required: true },
  traveler: travelerSchema,
  addOns: [addOnSchema],
  costBreakdown: costBreakdownSchema,
  status: { type: String, default: 'Confirmed' },
  cancelledAt: { type: Date }
}, {
  timestamps: true
});

export const Reservation = mongoose.model('Reservation', reservationSchema);
