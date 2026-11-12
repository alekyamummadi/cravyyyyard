import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      minlength: [2, 'Restaurant name must be at least 2 characters'],
      maxlength: [100, 'Restaurant name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    cuisine: {
      type: String,
      required: [true, 'Cuisine is required'],
      trim: true,
      maxlength: [50, 'Cuisine cannot exceed 50 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    openingHours: {
      type: String,
      trim: true,
      default: '9:00 AM - 10:00 PM',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching and filtering performance
restaurantSchema.index({ name: 'text', location: 1, cuisine: 1 });

export default mongoose.model('Restaurant', restaurantSchema);
