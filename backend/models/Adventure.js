import mongoose from 'mongoose';

const itineraryStepSchema = new mongoose.Schema({
  time: String,
  title: String,
  detail: String
}, { _id: false });

const adventureSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  cityId: { type: String, required: true, index: true },
  cityName: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true, index: true },
  costPerHead: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  duration: { type: Number, required: true },
  durationUnit: { type: String, default: 'Hours' },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 1 },
  groupSize: { type: String, default: 'Small Group (Max 8)' },
  image: { type: String, required: true },
  gallery: [{ type: String }],
  description: { type: String, default: '' },
  highlights: [{ type: String }],
  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
  itinerary: [itineraryStepSchema],
  meetingPoint: { type: String, default: '' },
  availableSlots: [{ type: String }],
  freeCancellationHours: { type: Number, default: 48 }
}, {
  timestamps: true
});

export const Adventure = mongoose.model('Adventure', adventureSchema);
