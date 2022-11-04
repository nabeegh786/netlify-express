const asyncHandler = require('../middlewear/async');
const { User } = require('../models/User');
const { isValidObjectId } = require('mongoose');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const setCookie = require('../helpers/cookieHandler'); 
const schedule = require('node-schedule');
const sendEmail = require('../helpers/nodeMailer');




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
            .select('-passwordHash');

        if (!user) {
            return res.status(404).json({ Success: false, Message: 'User not found' , responseCode :404})
        }

        return res.status(200).json({Payload : user , responseCode :400});
    }
    const users = await User.find()
        .select('-passwordHash');

    if (!users) {
        return res.status(404).json({ Success: false, Message: 'no user found', responseCode :404 });
    }
    
    return res.status(200).json({ Success: true, Users: users , responseCode :200});
    
    
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

exports.addUser = asyncHandler(async (req, res, next) => {

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
    return res.status(200).json({ Success: true, Message: 'user added successfully', Payload: data, responseCode :200 });

});



exports.login = asyncHandler(async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ Success: false, Message: errors.array()[0].msg , responseCode :400});
    }

    user = await User.findOne({ $or: [{ email: req.body.username }, { username: req.body.username }] });

    if (!user) {
        return res.status(400).json({ Success: false, Message: 'Incorrect Credentials' , responseCode :400});
    }
    if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
        let data = {
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            isRenter: user.isRenter
        };
        var token = await jwt.sign({ user: data }, jwtsecret, {

            expiresIn: jwtexpiry // expires in 50s

        });
        setCookie('jwt_token', token, req, res);
        sendEmail();
        return res.status(200).json({ Success: true, Message: 'User logged in successfully', Payload: data , responseCode :200});
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

// var d;
// d = new Date('2014-01-01 10:11:55');
// alert(d.getMinutes() + ':' + d.getSeconds()); //11:55
// d.setSeconds(d.getSeconds() + 10);
// alert(d.getMinutes() + ':0' + d.getSeconds()); //12:05


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