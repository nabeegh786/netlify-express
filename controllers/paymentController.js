const {User} = require('../models/User');
const {Booking} = require('../models/Booking');
const {CardDetails} = require('../models/CardDetails');
const {Transaction} = require('../models/Transaction');
const {Payment} = require('../models/Payment');
const asyncHandler = require('../middlewear/async');
const {sendEmail} = require('../helpers/nodeMailer');
const jwt = require('jsonwebtoken');
const setCookie = require('../helpers/cookieHandler'); 
const bcrypt = require('bcryptjs');






exports.makePayment = asyncHandler(async (req,res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ Success: false, Message: errors.array()[0].msg , responseCode :400});
    }

    
   
});


//check if token expired  
var expired =  asyncHandler( (date, expiryDuration) => {

    var OtpDate =  date;
    var dateNow = new Date();
    var expiry = expiryDuration*60*1000;
    var difference = (dateNow - new Date(OtpDate));
    if(difference < expiry)
    {
   
        return true;

    }
    return false;
});


