const express = require('express');

const router = express.Router();

const {
    makePayment
} = require('../controllers/paymentController');

const { paymentValidation } = require('../middlewear/validator');


const advancedResults = require('../middlewear/advancedResults');
const { protect, authorize } = require('../middlewear/auth');

router
  .route('/makepayment')
  .post(protect, authorize('user'),paymentValidation,makePayment);





module.exports = router;
