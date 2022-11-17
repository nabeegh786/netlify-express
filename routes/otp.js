const express = require('express');
const {
    forgotPassword,
    verifyOTP,
    ChangePassword
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

  router
  .route('/changepassword')
  .post(protect, authorize('user'), ChangePassword);



module.exports = router;
