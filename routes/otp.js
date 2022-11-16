const express = require('express');
const {
    forgotPassword,
    verifyOTP
} = require('../controllers/otpController');


const router = express.Router({ mergeParams: true });

const advancedResults = require('../middlewear/advancedResults');
const { protect, authorize } = require('../middlewear/auth');

router
  .route('/forgotpassword')
  .post(forgotPassword);

  router
  .route('/verifyotp')
  .post(verifyOTP);



module.exports = router;
