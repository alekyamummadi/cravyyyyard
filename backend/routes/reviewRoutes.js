import express from 'express';
import { updateReview, deleteReview } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/:id')
  .put(protect, authorize('customer'), updateReview)
  .delete(protect, authorize('customer', 'admin'), deleteReview);

export default router;
