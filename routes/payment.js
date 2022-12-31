const express = require('express');

const router = express.Router();

const {
  getPayments
} = require('../controllers/paymentController');

const { paymentValidation } = require('../middlewear/validator');


const advancedResults = require('../middlewear/advancedResults');
const { protect, authorize } = require('../middlewear/auth');

router
  .route('/getpayments')
  .get(protect, authorize('user'),getPayments);





module.exports = router;
