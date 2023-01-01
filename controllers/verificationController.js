const asyncHandler = require('../middlewear/async');
const { User } = require('../models/User');
const { Verification } = require('../models/Verification');
const axios = require('axios')
var FormData = require('form-data');
const {deleteImages} = require('../helpers/deleteImages');






exports.verifyUser = asyncHandler(async (req, res, next) => {
   const files = req.files; 
   if(typeof(files.cnicFront)=='undefined' || typeof(files.cnicBack)=='undefined' || typeof(files.licenseFront)=='undefined' || typeof(files.licenseBack)=='undefined' || typeof(files.utilityBill)=='undefined' || typeof(files.image)=='undefined'){
       var missingFields = await deleteImages(files,'verification');
       return res.status(400).json({Success:false,Message: missingFields+ 'not provided', responseCode :400});
   }
   var isfaceMatched = false;
   const formData = new FormData();
   formData.append('file1', files.image[0].path, files.image[0].originalname);
   formData.append('file2', files.cnicFront[0].path, files.cnicFront[0].originalname);
   let response;

   await axios.post('http://127.0.0.1:8000/uploadfile/', formData, {
         headers: {
               'Content-Type': `multipart/form-data;`
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
      //const basePath = `${req.protocol}://${req.get('host')}/public/images/verification/`;
      const basePath = `${req.protocol}://localhost:8000/public/images/verification/`;

      let verification = new Verification({
         cnicFront      :     `${basePath+'cnicFront/'}${files.cnicFront[0].filename}`,
         cnicBack       :     `${basePath+'cnicBack/'}${files.cnicBack[0].filename}`,
         licenseFront   :     `${basePath+'licenseFront/'}${files.licenseFront[0].filename}`,
         licenseBack    :     `${basePath+'licenseBack/'}${files.licenseBack[0].filename}`,
         utilityBill    :     `${basePath+'utilityBill/'}${files.utilityBill[0].filename}`,
         image          :     `${basePath+'image/'}${files.image[0].filename}`,
     })

     verification = await verification.save();
      if (!verification) return res.status(500).json({ Success: false, Message: 'Something went wrong cannot verify account', responseCode :500 });

      let verify = await User.findByIdAndUpdate(
         req.user._id ,
         { $set: { isVerified : true, verificationID : verification._id}}
         ,{new : true}
         );

      if(!verify) return res.status(500).json({ Success: false, Message: 'Something went wrong cannot verify account', responseCode :500 });
      
      return res.status(200).json({Success:false,Message: 'your account has been successfully verified', responseCode :200});


});




exports.isVerified = asyncHandler(async (req, res, next) => {
   var isVerified = req.user.isVerified;
   
   if(!isVerified){
      return res.status(400).json({Success:false,Message: 'your account is not verified', responseCode :400});
   }
   return res.status(200).json({Success:true,Message: 'your account is verified', responseCode :200});
});