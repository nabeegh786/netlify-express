const express = require('express');
const router = express.Router();
const {addBooking,getBookings,getMyBookings} = require('../controllers/bookingController');
const advancedResults = require('../middlewear/advancedResults');
const { Booking } = require('../models/Booking');
const { addBookingValidation ,getBookingsValidation} = require('../middlewear/validator');
const { protect, authorize } = require('../middlewear/auth');

router.route(`/`)
      .post(addBookingValidation,addBooking)
      .get(getBookingsValidation,advancedResults(Booking,'vehicle renter rentee'),getBookings)


router.route(`/getmybookings`)
      .get(protect,authorize('user'),getMyBookings)


// router.route(`/:id`)
//         .get(getBookingById)
//         .put(updateBooking)


module.exports = router;