import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      validate: {
        validator: function (v) {
          // Must be an integer between 1 and 5
          return Number.isInteger(v) && v >= 1 && v <= 5;
        },
        message: 'Rating must be an integer between 1 and 5',
      },
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Enforce rule: A customer can submit only one review per restaurant
reviewSchema.index({ customer: 1, restaurant: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
