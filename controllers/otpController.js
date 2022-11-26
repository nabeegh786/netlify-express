const {User} = require('../models/User');
const {Otp} = require('../models/Otp');
const asyncHandler = require('../middlewear/async');
const {sendEmail} = require('../helpers/nodeMailer');
const jwt = require('jsonwebtoken');
const setCookie = require('../helpers/cookieHandler'); 
const bcrypt = require('bcryptjs');


require('dotenv/config');
const bcryptsecret = process.env.BCRYPT_SECRET;
const jwtsecret = process.env.JWT_SECRET;
const jwtexpiry = process.env.JWT_EXPIRY;




exports.forgotPassword = asyncHandler(async (req,res) => {
    var username = req.body.username;
    if(username === '' || username == null){
        return res.status(400).json({Success:false,Message : 'username or email not provided', responseCode : 400});
    }
    const user = await User.findOne({ $or: [{ email: username }, { username: username }] });
    if(!user){
        return res.status(400).json({Success:false,Message : 'Invalid Username or Email', responseCode : 400});
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
            sendEmail(user.email,'Reset Rentwheels Password',`Forgot your Password? \nEnter this Code => ${otpCode} to change your password. The token will expire in 5 minutes.`);
        }
      )
   
    return res.status(200).json({Success:true,Message : `Reset Password Code Sent successfully to : ${user.email}`, responseCode : 200});
   
});

exports.verifyOTP = asyncHandler(async (req,res) => {
    var username = req.body.username;
    var otpCode = req.body.otp;
    if(username === '' || username == null){
        return res.status(400).json({Success:false,Message : 'username or email not provided', responseCode : 400});
    }
    if(otpCode === '' || otpCode == null){
        return res.status(400).json({Success:false,Message : 'OTP not provided', responseCode : 400});
    }
    const otp = await Otp.findOne({otp : otpCode}).populate('user');
    if(!otp){
        return res.status(400).json({Success:false,Message : 'Invalid Code', responseCode : 400});
    }
    if(otp.user.username != username && otp.user.email != username){
        return res.status(400).json({Success:false,Message : 'Invalid Code', responseCode : 400});
    }
    var isOtpExpired = await expired(otp.updatedAt,5);
    if(!isOtpExpired){
        return res.status(400).json({Success:false,Message : 'OTP Code Expired', responseCode : 400});
    }

    var token = await jwt.sign({ user: otp.user }, jwtsecret, {

        expiresIn: jwtexpiry // expires in 500s

    });
    
    setCookie('jwt_token', token, req, res);
   
    return res.status(200).json({Success:true,Message : `OTP Code Validated`, responseCode : 200});
   
});

exports.ChangePassword = asyncHandler(async (req,res) => {
   
    var passwordHash = bcrypt.hashSync(req.body.password, +bcryptsecret);

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            passwordHash : passwordHash
        },
        { new: true }
    );
       
    if(!updatedUser){
        return res.status(400).json({Success:false,Message : 'Something went wrong, cannot change password', responseCode : 400});
    }

    return res.status(200).json({Success:true,Message : `Password Changed Successfully`, responseCode : 200});
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


