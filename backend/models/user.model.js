import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
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
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;