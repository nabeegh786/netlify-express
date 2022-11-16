const {User} = require('../models/User');
const {Otp} = require('../models/Otp');
const asyncHandler = require('../middlewear/async');
const {sendEmail} = require('../helpers/nodeMailer');
const jwt = require('jsonwebtoken');
const setCookie = require('../helpers/cookieHandler'); 


require('dotenv/config');
const bcryptsecret = process.env.BCRYPT_SECRET;
const jwtsecret = process.env.JWT_SECRET;
const jwtexpiry = process.env.JWT_EXPIRY;




exports.forgotPassword = asyncHandler(async (req,res) => {
    var username = req.body.username;
    if(username === '' || username == null){
        return res.status(400).json({Success:false,Message : 'username not provided', responseCode : 400});
    }
    const user = await User.findOne({username : username});
    if(!user){
        return res.status(400).json({Success:false,Message : 'Invalid Username', responseCode : 400});
    }
    var otpCode = Math.round(Math.random() * 1E9).toString().substring(0,5);
   
    // update the otp code if already exist else insert
    Otp.findOneAndUpdate(
        { user:  user._id },
        { $set: { otp: otpCode } },
        { upsert: true, new: true },
        function(error) {
            if (error) return res.status(500).json({Success:false,Message : 'something went wrong', responseCode : 500});
            
            // if otp saved successfully then send otp code to User via email
            sendEmail(user.email,'Reset Rentwheels Password',`Forgot your Password? \nEnter this Code => ${otpCode} to change your password.\nThe token will expire in 5 minutes.`);
        }
      )
   
    return res.status(200).json({Success:true,Message : `Reset Password Code Sent successfully to : ${user.email}`, responseCode : 200});
   
});

exports.verifyOTP = asyncHandler(async (req,res) => {
    var username = req.body.username;
    var otpCode = req.body.otp;
    if(username === '' || username == null){
        return res.status(400).json({Success:false,Message : 'username not provided', responseCode : 400});
    }
    if(otpCode === '' || otpCode == null){
        return res.status(400).json({Success:false,Message : 'OTP not provided', responseCode : 400});
    }
    const otp = await Otp.findOne({otp : otpCode}).populate('user');
    if(!otp){
        return res.status(400).json({Success:false,Message : 'Invalid Code', responseCode : 400});
    }
    if(otp.user.username != username){
        return res.status(400).json({Success:false,Message : 'Invalid Code', responseCode : 400});
    }
    if(expired(otp.updatedAt,5000)){
        return res.status(400).json({Success:false,Message : 'OTP Code Expired', responseCode : 400});
    }

    var token = await jwt.sign({ user: otp.user }, jwtsecret, {

        expiresIn: jwtexpiry // expires in 500s

    });
    setCookie('jwt_token', token, req, res);
   
    return res.status(200).json({Success:true,Message : `OTP Code Validated`, responseCode : 200});
   
});



//calculate days 
var days =  asyncHandler( (date_1, date_2) => {
    let difference =  date_2.getTime()-date_1.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
});

//check if token expired days 
var expired =  asyncHandler( (date, expiryDuration) => {

    var TokenExpiryDate =  date;
    var dateNow = new Date();
    var expiry = expiryDuration*60*1000;
    var difference = (dateNow - new Date(TokenExpiryDate));
    if(difference < expiry) {
        return true

    }
    return false;
});


