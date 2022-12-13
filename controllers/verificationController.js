const asyncHandler = require('../middlewear/async');
const compare = require('../middlewear/faceComparision');
const { User } = require('../models/User');
const { isValidObjectId } = require('mongoose');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const setCookie = require('../helpers/cookieHandler'); 
const {sendNotification} = require('../helpers/notifications'); 
const schedule = require('node-schedule');
var fs = require('fs');

require('dotenv/config');
const bcryptsecret = process.env.BCRYPT_SECRET;
const jwtsecret = process.env.JWT_SECRET;
const jwtexpiry = process.env.JWT_EXPIRY;



// exports.verifyUser = asyncHandler(async (req, res, next) => {

//     // const files = req.files; 
//     // if(typeof(files.cnicFront)=='undefined' || typeof(files.cnicBack)=='undefined' || typeof(files.licenseFront)=='undefined' || typeof(files.licenseBack)=='undefined' || typeof(files.utilityBill)=='undefined' || typeof(files.image)=='undefined'){
//     //     var missingFields = deleteImages(files);
//     //     return res.status(500).json({ Success: false, Message : missingFields+ 'not provided', responseCode :500});
//     // }

    

//     // var isfaceMatching = await compare(files.cnicFront[0].path,files.image[0].path);

    
//     // if(isfaceMatching){
//     //     return res.status(200).json({ Success: false, Message : 'faces not matched' , responseCode :400});
//     // }

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({Success:false,Message: errors.array()[0].msg , responseCode :400});
//     }

//     var isfaceMatching = res.facesMatched;

    
//         if(!isfaceMatching){
//             return res.status(200).json({ Success: false, Message : 'faces not matched' , responseCode :400});
            
//         }

//     return res.status(200).json({ Success: true, Message : 'succcessfully verified' , responseCode :200});
    
// });



var deleteImages = (files) => {
    var missingField = "";
    
    if(files.cnicFront){
        var path = files.cnicFront[0].path; 
        fs.unlinkSync(path);   
    }else missingField += missingField == "" ? "cnic front " : ", cnic front "; 
     if(files.cnicBack){
        var path = files.cnicBack[0].path;
        fs.unlinkSync(path);
        
     }else missingField += missingField == "" ? "cnic back image  " : ", cnic back image "; 
     if(files.licenseFront){
        var path = files.licenseFront[0].path; 
        fs.unlinkSync(path);
        
     }else missingField += missingField == "" ? "license front image " : ", license front image "; 
     if(files.licenseBack){
        var path = files.licenseBack[0].path; 
        fs.unlinkSync(path);
        
     }else missingField += missingField == "" ? "license back image " : ", license back image "; 
     if(files.utilityBill){
        var path = files.utilityBill[0].path; 
        fs.unlinkSync(path);
        
     }else missingField += missingField == "" ? "utility bill image " : ", utility bill image "; 
     if(files.image){
        var path = files.image[0].path;
        fs.unlinkSync(path);
        
     }else missingField +=  missingField == "" ? "user verification image " : ", user verification image ";  
     return missingField;
    }