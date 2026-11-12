import express from 'express';
import {
  getAdminDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  createRestaurantOwner,
  assignOwnerToRestaurant,
  getAllReviewsForAdmin,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes are protected and strictly require the 'admin' role
router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/owners', createRestaurantOwner);
router.put('/restaurants/:restaurantId/assign-owner', assignOwnerToRestaurant);
router.get('/reviews', getAllReviewsForAdmin);

export default router;
