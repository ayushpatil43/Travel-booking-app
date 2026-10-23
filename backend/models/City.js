import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  country: { type: String, required: true },
  tagline: { type: String, default: '' },
  image: { type: String, required: true },
  adventureCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const City = mongoose.model('City', citySchema);
