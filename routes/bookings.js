const express = require('express');
const router = express.Router();
const {addBooking,getBookings} = require('../controllers/bookingController');
const advancedResults = require('../middlewear/advancedResults');
const { Booking } = require('../models/Booking');
const { addBookingValidation ,getBookingsValidation} = require('../middlewear/validator');

router.route(`/`)
      .post(addBookingValidation,addBooking)
      .get(getBookingsValidation,advancedResults(Booking,'vehicle renter rentee'),getBookings)


// router.route(`/:id`)
//         .get(getBookingById)
//         .put(updateBooking)


module.exports = router;