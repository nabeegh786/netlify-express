const express = require('express');

const router = express.Router();

const {
  getAppStatistics
} = require('../controllers/statsController');

const { paymentValidation } = require('../middlewear/validator');


const advancedResults = require('../middlewear/advancedResults');
const { protect, authorize } = require('../middlewear/auth');

router
  .route('/appstatistics')
  .get(
      //protect, authorize('user','admin'),
    getAppStatistics);





module.exports = router;
