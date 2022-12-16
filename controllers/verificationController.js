const asyncHandler = require('../middlewear/async');
const compare = require('../middlewear/faceComparision');
const { User } = require('../models/User');
const { Verification } = require('../models/Verification');
const { isValidObjectId } = require('mongoose');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const setCookie = require('../helpers/cookieHandler'); 
const {sendNotification} = require('../helpers/notifications'); 
const schedule = require('node-schedule');
var fs = require('fs');
const axios = require('axios')
var FormData = require('form-data');







exports.verifyUser = asyncHandler(async (req, res, next) => {
   const files = req.files; 
   if(typeof(files.cnicFront)=='undefined' || typeof(files.cnicBack)=='undefined' || typeof(files.licenseFront)=='undefined' || typeof(files.licenseBack)=='undefined' || typeof(files.utilityBill)=='undefined' || typeof(files.image)=='undefined'){
       var missingFields = deleteImages(files);
       return res.status(400).json({Success:false,Message: missingFields+ 'not provided', responseCode :400});
   }
   var isfaceMatched = false;
   const formData = new FormData();
   formData.append('files', files.image[0].path, files.image[0].originalname);
   let response;

   await axios.post('http://127.0.0.1:8000/uploadfile/', formData, {
         headers: {
               'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
         }
      }).then((responseFromServer2) => {
         console.log("first",responseFromServer2.data)
         response = responseFromServer2.data
         console.log("Sucess ->> ",response.Success);
      }).catch((err) => {
         console.log("Err ->>",err)
      })
      
      if(typeof(response.Success)=='undefined'){
         return res.status(500).json({Success:false,Message: 'Something Went Wrong Cannot Verify Account', responseCode :500});
      }
      if(response.Success == 'true' || response.Success == true){
         isfaceMatched = true;
      }

      if(!isfaceMatched){
         return res.status(400).json({Success:false,Message: 'Face Does not match with CNIC', responseCode :400});
      }

      let verification = new Verification({
         cnicFront: files.cnicFront[0].path,
         cnicBack: files.cnicBack[0].path,
         licenseFront: files.licenseFront[0].path,
         licenseBack: files.licenseBack[0].path,
         utilityBill: files.utilityBill[0].path,
         image: files.image[0].path,
     })

     verification = await verification.save();
      if (!verification) return res.status(500).json({ Success: false, Message: 'Something went wrong cannot verify account', responseCode :500 });

      let verify = await User.findByIdAndUpdate(
         req.user._id ,
         { $set: { isVerified : true, verificationID : verification._id}}
         ,{new : true}
         );

      if(!verify) return res.status(500).json({ Success: false, Message: 'Something went wrong cannot verify account', responseCode :500 });
      
      return res.status(400).json({Success:false,Message: 'your account has been successfully verified', responseCode :400});


});




exports.isVerified = asyncHandler(async (req, res, next) => {
   var isVerified = req.user.isVerified;
   
   if(!isVerified){
      return res.status(400).json({Success:false,Message: 'your account is not verified', responseCode :400});
   }
   return res.status(200).json({Success:true,Message: 'your account is verified', responseCode :200});
});







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