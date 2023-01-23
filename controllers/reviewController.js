const asyncHandler = require('../middlewear/async');
const Review = require('../models/Review');
const {Vehicle} = require('../models/Vehicle');

// @desc      Get reviews
// @route     GET /api/v1/reviews
// @route     GET /api/v1/vehcles/:vehicleId/reviews
// @access    Public
exports.getReviews = asyncHandler(async (req, res, next) => { 
  if (req.params.vehicleId) {
    const reviews = await Review.find({ vehicle: req.params.vehicleId }).populate({
      path: 'user',
      select: 'username'
    });

    return res.status(200).json({
      success : true,
      count   : reviews.length,
      Payload : reviews
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'user',
    select: 'username'
  });

  if (!review) {
    return res.status(404).json({Message: `No review found with the id of ${req.params.id}` , responseCode :404});
  }

  res.status(200).json({
    success : true,
    Payload : review
  });
});

// @desc      Add review
// @route     POST /api/v1/vehicles/:vehicleId/reviews
// @access    Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.vehicle = req.params.vehicleId;
  req.body.user = req.user.id;
  console.log(req.body.rating);

  const vehicle = await Vehicle.findById(req.params.vehicleId);

  if (!vehicle) {
    return res.status(404).json({Message: `No vehicle with the id of ${req.params.vehicleId}` , responseCode :404});
  }

  let reviewBody = new Review({
        text    : req.body.text,
        rating  : req.body.rating,
        vehicle : req.body.vehicle,
        user    : req.body.user });
        
  const review = await reviewBody.save();

  res.status(200).json({
    success : true,
    Payload : review
  });
});

// @desc      Update review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({Message: `No review with the id of ${req.params.id}`, responseCode :404});
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({Message: `Not authorized to update review` , responseCode :403});
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new            : true,
    runValidators  : true
  });

  res.status(200).json({
    success : true,
    Payload : review
  });
});

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({Message: `No review with the id of ${req.params.id}` , responseCode :404});
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({Message: `Not authorized to delete review` , responseCode :403});
  }

  await review.remove();

  res.status(200).json({
    success : true,
    Message : `deleted successfully`
  });
});
