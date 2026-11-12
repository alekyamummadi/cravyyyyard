import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant.js';
import Review from '../models/Review.js';
import { isValidObjectId } from '../middleware/validation.js';

// Helper: Aggregation pipeline for rating distribution & summary for a restaurant
export const getRestaurantRatingStats = async (restaurantId) => {
  const objectId = new mongoose.Types.ObjectId(restaurantId);

  const stats = await Review.aggregate([
    { $match: { restaurant: objectId } },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 },
            },
          },
        ],
        distribution: [
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const summary = stats[0]?.summary[0] || { averageRating: 0, totalReviews: 0 };
  const rawDist = stats[0]?.distribution || [];

  // Map into fixed 1..5 stars structure
  const distributionMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rawDist.forEach((item) => {
    if (distributionMap[item._id] !== undefined) {
      distributionMap[item._id] = item.count;
    }
  });

  const total = summary.totalReviews;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: distributionMap[star],
    percentage: total > 0 ? Math.round((distributionMap[star] / total) * 100) : 0,
  }));

  return {
    averageRating: summary.totalReviews > 0 ? Number(summary.averageRating.toFixed(1)) : null,
    totalReviews: summary.totalReviews,
    distribution,
  };
};

// @desc   Get all restaurants with search & filtering + rating averages
// @route  GET /api/restaurants
// @access Public (with optional auth to detect customer's rating)
export const getAllRestaurants = async (req, res, next) => {
  try {
    const { name, location, cuisine, sort } = req.query;

    const query = {};

    // Search by name (case-insensitive partial match)
    if (name && name.trim()) {
      query.name = { $regex: name.trim(), $options: 'i' };
    }

    // Filter by location (case-insensitive partial match)
    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Filter by cuisine (case-insensitive partial match)
    if (cuisine && cuisine.trim()) {
      query.cuisine = { $regex: cuisine.trim(), $options: 'i' };
    }

    const restaurants = await Restaurant.find(query)
      .populate('owner', 'name email')
      .lean();

    // Fetch review metrics (average rating, review count) for all restaurants using aggregation
    const restaurantIds = restaurants.map((r) => r._id);

    const reviewMetrics = await Review.aggregate([
      { $match: { restaurant: { $in: restaurantIds } } },
      {
        $group: {
          _id: '$restaurant',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const metricsMap = {};
    reviewMetrics.forEach((m) => {
      metricsMap[m._id.toString()] = {
        averageRating: Number(m.averageRating.toFixed(1)),
        totalReviews: m.totalReviews,
      };
    });

    // If a user is logged in, fetch their submitted ratings for these restaurants
    let userRatingsMap = {};
    if (req.user) {
      const userReviews = await Review.find({
        customer: req.user._id,
        restaurant: { $in: restaurantIds },
      }).select('restaurant rating comment updatedAt');

      userReviews.forEach((rev) => {
        userRatingsMap[rev.restaurant.toString()] = {
          rating: rev.rating,
          comment: rev.comment,
          reviewId: rev._id,
        };
      });
    }

    // Merge data into output
    let result = restaurants.map((rest) => {
      const metrics = metricsMap[rest._id.toString()] || {
        averageRating: null,
        totalReviews: 0,
      };
      const userRatingInfo = userRatingsMap[rest._id.toString()] || null;

      return {
        ...rest,
        averageRating: metrics.averageRating,
        totalReviews: metrics.totalReviews,
        ratingText: metrics.totalReviews > 0 ? `${metrics.averageRating} / 5` : 'No ratings yet',
        customerRating: userRatingInfo ? userRatingInfo.rating : null,
        customerReview: userRatingInfo,
      };
    });

    // Optional sorting
    if (sort === 'rating_desc') {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sort === 'reviews_desc') {
      result.sort((a, b) => b.totalReviews - a.totalReviews);
    } else if (sort === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get single restaurant with full details, stats, distribution & user review
// @route  GET /api/restaurants/:id
// @access Public (with optional auth)
export const getRestaurantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
    }

    const restaurant = await Restaurant.findById(id).populate('owner', 'name email');
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Advanced MongoDB Aggregation for rating distribution and averages
    const ratingStats = await getRestaurantRatingStats(id);

    // Fetch user review if logged in
    let userReview = null;
    if (req.user) {
      userReview = await Review.findOne({
        customer: req.user._id,
        restaurant: id,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...restaurant.toObject(),
        averageRating: ratingStats.averageRating,
        totalReviews: ratingStats.totalReviews,
        ratingText: ratingStats.totalReviews > 0 ? `${ratingStats.averageRating} / 5` : 'No ratings yet',
        ratingDistribution: ratingStats.distribution,
        userReview: userReview
          ? {
              id: userReview._id,
              rating: userReview.rating,
              comment: userReview.comment,
              createdAt: userReview.createdAt,
              updatedAt: userReview.updatedAt,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Create restaurant
// @route  POST /api/restaurants
// @access Admin only
export const createRestaurant = async (req, res, next) => {
  try {
    const { name, cuisine, location, description, address, phone, openingHours, imageUrl, owner } = req.body;

    if (!name || !cuisine || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, cuisine, and location are required fields.',
      });
    }

    if (owner && !isValidObjectId(owner)) {
      return res.status(400).json({ success: false, message: 'Invalid owner user ID' });
    }

    const restaurant = await Restaurant.create({
      name: name.trim(),
      cuisine: cuisine.trim(),
      location: location.trim(),
      description: description ? description.trim() : '',
      address: address ? address.trim() : '',
      phone: phone ? phone.trim() : '',
      openingHours: openingHours ? openingHours.trim() : '9:00 AM - 10:00 PM',
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : undefined,
      owner: owner || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Restaurant created successfully.',
      data: restaurant,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Update restaurant details (Permitted details by Owner or Admin)
// @route  PUT /api/restaurants/:id
// @access Restaurant Owner (own restaurant only) or Admin
export const updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Role-based permission enforcement:
    // If owner, must be their assigned restaurant
    if (req.user.role === 'owner') {
      if (!restaurant.owner || restaurant.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only update your own assigned restaurant.',
        });
      }
    }

    const { name, description, cuisine, location, address, phone, openingHours, imageUrl, owner } = req.body;

    if (name) restaurant.name = name.trim();
    if (description !== undefined) restaurant.description = description.trim();
    if (cuisine) restaurant.cuisine = cuisine.trim();
    if (location) restaurant.location = location.trim();
    if (address !== undefined) restaurant.address = address.trim();
    if (phone !== undefined) restaurant.phone = phone.trim();
    if (openingHours !== undefined) restaurant.openingHours = openingHours.trim();
    if (imageUrl) restaurant.imageUrl = imageUrl.trim();

    // Only Admin can reassign owner
    if (req.user.role === 'admin' && owner !== undefined) {
      if (owner === null || owner === '') {
        restaurant.owner = null;
      } else if (isValidObjectId(owner)) {
        restaurant.owner = owner;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid owner user ID' });
      }
    }

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully.',
      data: restaurant,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete restaurant
// @route  DELETE /api/restaurants/:id
// @access Admin only
export const deleteRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Delete associated reviews
    await Review.deleteMany({ restaurant: id });
    await restaurant.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Restaurant and associated reviews deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get assigned restaurant for logged-in Restaurant Owner
// @route  GET /api/restaurants/owner/my-restaurant
// @access Restaurant Owner only
export const getMyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant currently assigned to your account.',
      });
    }

    const ratingStats = await getRestaurantRatingStats(restaurant._id);

    // Fetch reviews along with customer details who reviewed
    const reviews = await Review.find({ restaurant: restaurant._id })
      .populate('customer', 'name email createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        ...restaurant.toObject(),
        averageRating: ratingStats.averageRating,
        totalReviews: ratingStats.totalReviews,
        ratingText: ratingStats.totalReviews > 0 ? `${ratingStats.averageRating} / 5` : 'No ratings yet',
        ratingDistribution: ratingStats.distribution,
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
};
