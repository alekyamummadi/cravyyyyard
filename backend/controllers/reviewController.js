import Review from '../models/Review.js';
import Restaurant from '../models/Restaurant.js';
import { validateRating, isValidObjectId } from '../middleware/validation.js';

// @desc   Get all reviews for a restaurant
// @route  GET /api/restaurants/:restaurantId/reviews
// @access Public
export const getRestaurantReviews = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    if (!isValidObjectId(restaurantId)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
    }

    const reviews = await Review.find({ restaurant: restaurantId })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Submit a rating and review for a restaurant
// @route  POST /api/restaurants/:restaurantId/reviews
// @access Private (Customer only)
export const createReview = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { rating, comment } = req.body;

    if (!isValidObjectId(restaurantId)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
    }

    // Check restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Validate Rating (whole number 1 to 5)
    const ratingValidation = validateRating(rating);
    if (!ratingValidation.valid) {
      return res.status(400).json({
        success: false,
        message: ratingValidation.message,
      });
    }

    // Check if user already reviewed this restaurant
    const existingReview = await Review.findOne({
      customer: req.user._id,
      restaurant: restaurantId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this restaurant. You can update your existing review instead.',
        reviewId: existingReview._id,
      });
    }

    const newReview = await Review.create({
      customer: req.user._id,
      restaurant: restaurantId,
      rating: ratingValidation.value,
      comment: comment ? comment.trim() : '',
    });

    const populated = await newReview.populate('customer', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Update a review
// @route  PUT /api/reviews/:id
// @access Private (Customer who created the review only)
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Permission check: A customer must not be able to update another customer's review
    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own review.',
      });
    }

    if (rating !== undefined) {
      const ratingValidation = validateRating(rating);
      if (!ratingValidation.valid) {
        return res.status(400).json({
          success: false,
          message: ratingValidation.message,
        });
      }
      review.rating = ratingValidation.value;
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();
    const populated = await review.populate('customer', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete a review
// @route  DELETE /api/reviews/:id
// @access Private (Customer who created it, or Administrator)
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Permission check: Administrator can remove inappropriate reviews;
    // Customer can only delete their own review;
    // Other roles forbidden.
    const isOwner = review.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this review.',
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: isAdmin && !isOwner
        ? 'Review removed by administrator.'
        : 'Review deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
