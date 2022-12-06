const express = require('express');
const router = express.Router();
const {addBooking,getBookings,getMyBookings,approveOrRejectBooking,startRental} = require('../controllers/bookingController');
const advancedResults = require('../middlewear/advancedResults');
const { Booking } = require('../models/Booking');
const { addBookingValidation ,getBookingsValidation} = require('../middlewear/validator');
const { protect, authorize } = require('../middlewear/auth');

router.route(`/`)
      .post(addBookingValidation,addBooking)
      .get(getBookingsValidation,advancedResults(Booking,'vehicle renter rentee'),getBookings)


router.route(`/getmybookings`)
      .get(protect,authorize('user'),getMyBookings)


router.route(`/approveorrejectbooking`)
      .post(protect,authorize('user'),approveOrRejectBooking)


router.route(`/startrental`)
      .post(protect,authorize('user'),startRental)


// router.route(`/:id`)
//         .get(getBookingById)
//         .put(updateBooking)


module.exports = router;