const asyncHandler = require('../middlewear/async');
const { User } = require('../models/User');
const {Wallet} = require('../models/Wallet');
const { isValidObjectId } = require('mongoose');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const setCookie = require('../helpers/cookieHandler'); 
const {sendNotification} = require('../helpers/notifications'); 
const schedule = require('node-schedule');






require('dotenv/config');
const bcryptsecret = process.env.BCRYPT_SECRET;
const jwtsecret = process.env.JWT_SECRET;
const jwtexpiry = process.env.JWT_EXPIRY;



exports.getUsers = asyncHandler(async (req, res, next) => {

    if (req.params.id) {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ Success: false, Message: 'invalid user id', responseCode :400 });
        }
        const user = await User.findById(req.params.id)
            .select('-passwordHash').populate('verificationID');

        if (!user) {
            return res.status(404).json({ Success: false, Message: 'User not found' , responseCode :404})
        }

        return res.status(200).json({Payload : user , responseCode :400});
    }
    //const users = await User.find()
    //    .select('-passwordHash').populate('verificationID');
    const count = res.advancedResults.count;
    if (count < 1) {
        return res.status(404).json({ Success: false, Message: 'no user found', responseCode :404 });
    }
    
    return res.status(200).json({ Success: true, Users: res.advancedResults , responseCode :200});
    
    
});

exports.isValidCred = asyncHandler(async (req,res)=>{
    const username = await User.findOne({username:req.body.username});
    if(username){
        return res.status(400).json({ Success: false, Message: 'username already exists', responseCode :400 });
    }
    const email = await User.findOne({email:req.body.email});
    if(email){
        return res.status(400).json({ Success: false, Message: 'email already exists', responseCode :400 });
    }
    return res.status(200).json({ Success: true, Message : 'username and email is correct', responseCode :200});
});


exports.noti = asyncHandler(async (req,res)=>{
    var firebaseToken = req.body.token;
    sendNotification('RentWheels Booking Confirmed Notification','Your Booking Has Been Confirmed Check  you booking list for further information', firebaseToken);    
    return res.status(200).json({ Success: true, Message : 'Notification Sent', responseCode :200});
});



exports.userVerificatiion = asyncHandler(async (req, res, next) =>{
     
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({Success:false,Message: errors.array()[0].msg , responseCode :400});
    }
    if(!req.file){
        return res.status(400).json({Success:false,Message: 'category image not provided' , responseCode :400});
        
    }
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/images/verification/`;
   
   
    return  res.status(200).json({Success:true,Message:'image saved at path = '+basePath+fileName, responseCode :200});
     
});



exports.verifyUser = asyncHandler(async (req,res)=>{
    return res.status(200).json({ Success: true, Message : 'User is Authenticated', responseCode :200});
});

exports.addUser = asyncHandler(async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ Success: false, Message: errors.array()[0].msg , responseCode :400});
    }
    let user = new User({
        username: req.body.username,
        passwordHash: bcrypt.hashSync(req.body.password, +bcryptsecret),
        email: req.body.email,
        phone: req.body.phone
    })

    user = await user.save();
    if (!user) return res.status(500).json({ Success: false, Message: 'Something went wrong cannot add user', responseCode :500 });
    let data = {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isRenter: user.isRenter
    };
    var userWallet = new Wallet({
        user: user._id,
        balance: 0
    });
    await userWallet.save();
    return res.status(200).json({ Success: true, Message: 'user added successfully', Payload: data, responseCode :200 });

});



exports.login = asyncHandler(async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ Success: false, Message: errors.array()[0].msg , responseCode :400});
    }

    user = await (await User.findOne({ $or: [{ email: req.body.username }, { username: req.body.username }] })).populate("verificationID");

    if (!user) {
        return res.status(400).json({ Success: false, Message: 'Incorrect Credentials' , responseCode :400});
    }
    if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
        let data = {
            _id              : user._id,
            username         : user.username,
            email            : user.email,
            phone            : user.phone,
            isRenter         : user.isRenter,
            isVerified       : user.isVerified,
            profilePicture   : user.profilePicture,
            verification     : user.verificationID
        };
        var token = await jwt.sign({ user: data }, jwtsecret, {

            expiresIn: jwtexpiry // expires in 50s

        });
        if(req.body.firebaseToken){
        await User.findByIdAndUpdate(
                user._id,
                {
                    firebaseToken: req.body.firebaseToken
                },
                {new : true}
            )
        }
        setCookie('jwt_token', token, req, res);
        return res.status(200).json({ Success: true, Message: 'User logged in successfully', Payload: data , token: token , responseCode :200});
    }
    return res.status(400).json({ Success: false, Message: 'Incorrect Password', responseCode :400 });

}
);


exports.promoteUserToRenter = asyncHandler(async (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        res.status(400).json({ Success: false, Message: "Invalid User Id", responseCode :400});
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.body.id,
        {
            isRenter: true
        },
        { new: true }
    )
        .select('-passwordHash');
    if (!updatedUser) return res.status(400).json({ Success: false, Message: "User doesn't exist" , responseCode :400});

    return res.status(200).json({ Success: true, Message: 'User updated successfully', User: updatedUser , responseCode : 200});

});




exports.isfaceMatched = asyncHandler(async (req, res, next) => {
    if (res.facesMatched) {
        return res.status(200).json({ Success: true, Message: 'Face Matched with CNIC', responseCode :200});
    }
    return res.status(200).json({ Success: false, Message: 'Face Did not Match with CNIC' , responseCode :200 });

});


exports.validateUser = asyncHandler(async (req,res,nex) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ Success: false, Message: errors.array()[0].msg, responseCode :400 });
    }
    return res.status(200).json({ Success: true, Message: 'user information is correct', responseCode :200 });
});



exports.userJob = asyncHandler(async (req,res,next) => {
    let i = 0;
    let timeObject = new Date(); 
    timeObject = new Date(timeObject.getTime() + 1000 * 10);
    schedule.scheduleJob(timeObject, ()=> {
        console.log(`Job ${i} Ran..`);
       
    });
    i++;
    return res.send("Job Set");
   
});

exports.updateProfile = asyncHandler(async (req,res,next) => {
    const file = req.file; 
    var fileURL = null;
    const basePath = `${req.protocol}://${req.get('host')}/public/images/`;
    if(typeof(file)!='undefined'){
        fileURL = `${basePath+'user-profile/'}${file.filename}`;
        
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ Success: false, Message: errors.array()[0].msg , responseCode :400});
    }

    let user = await User.findByIdAndUpdate(
        req.user._id ,
        { $set: { username : req.body.username, email : req.body.email, phone : req.body.phone, profilePicture : fileURL }}
        ,{new : true}
        );
    
    if(!user) return res.status(500).json({ Success: false, Message: 'Something Went Wrong Cannot Update Profile' , responseCode :500});

    return res.status(200).json({ Success: true, Message: 'Profile Updated Successfully' , responseCode :200});
});