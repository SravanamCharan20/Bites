import mongoose, { Schema, model } from 'mongoose';

const foodItemSchema = new Schema({
  type: String,
  name: String,
  quantity: String,
  unit: String,
  expiryDate: Date,
});

const donorSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true,
  },
  address: {
    street: {
      type: String,
      required: false,  // Make this optional
    },
    city: {
      type: String,
      required: false,  // Make this optional
    },
    state: {
      type: String,
      required: false,  // Make this optional
    },
    postalCode: {
      type: String,
      required: false,  // Make this optional
    },
    country: {
      type: String,
      required: false,  // Make this optional
    },
  },
  location: {
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    state: {
      type: String,
      required: false,
      trim: true,
    },
  },
  foodItems: [foodItemSchema],
  availableUntil: {
    type: Date,
    required: false,
  },
}, { timestamps: true });

export default model('Donor', donorSchema);