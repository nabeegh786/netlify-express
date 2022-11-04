const express = require('express');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middlewear/advancedResults');
const { protect, authorize } = require('../middlewear/auth');

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'vehicle',
      select: 'vehicleCategory description'
    }),
    getReviews
  )
  .post(protect, authorize('user', 'admin'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
