import express from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurant,
} from '../controllers/restaurantController.js';
import {
  getRestaurantReviews,
  createReview,
} from '../controllers/reviewController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Specific routes first before /:id parameter routes
router.get('/owner/my-restaurant', protect, authorize('owner'), getMyRestaurant);

router.route('/')
  .get(optionalAuth, getAllRestaurants)
  .post(protect, authorize('admin'), createRestaurant);

router.route('/:id')
  .get(optionalAuth, getRestaurantById)
  .put(protect, authorize('owner', 'admin'), updateRestaurant)
  .delete(protect, authorize('admin'), deleteRestaurant);

// Nested reviews endpoints
router.route('/:restaurantId/reviews')
  .get(getRestaurantReviews)
  .post(protect, authorize('customer'), createReview);

export default router;
