const express = require('express');
const router = express.Router();
const { getUsers,
       addUser,
       verifyUser,
       login, 
       promoteUserToRenter,
       isfaceMatched,
       validateUser,
       userJob,
       isValidCred,
      noti,
      userVerificatiion } = require('../controllers/userController');

const { userVerificationStorage } = require('../middlewear/multerStorage')

const multer = require('multer');

const uploadOptionsUserVerification = multer({storage: userVerificationStorage});

const { userLoginValidation, userRegistrationValidation } = require('../middlewear/validator');

const {protect, authorize} = require('../middlewear/auth');
const compare = require('../middlewear/faceComparision');

// Include other resource routers
const otp = require('../routes/otp');


// http://localhost:8000/api/v1/users
router.use('/otp', otp);



router.route(`/test`)
      .get(compare, isfaceMatched);
      
router.route(`/noti`)
      .get(noti);

router.route(`/verify`)
      .get(protect, verifyUser);

router.route(`/verification`)
      .post((req,res,next) => {
            uploadOptionsUserVerification.single('image')(req, res, function (err) {
                    if (err instanceof multer.MulterError) {
                    if(err.message === 'Unexpected field'){
                            return res.status(400).json({Success:false,Message:'more than 1 image is not allowed for user veriification', responseCode : 400});
                    }
                    // A Multer error occurred when uploading
                    return res.status(500).json({Success:false,Message:err.message, responseCode : 500});
                    } else if (err) {
                      // An unknown error occurred when uploading.
                     return res.status(400).json({Success:false,Message:err.message, responseCode : 500});      
                    }else{
                     // Everything went fine.
                    next();
                    }
                   
            })
    },userVerificatiion);

router.route(`/validatetoken`)
      .get(protect, (req,res)=> {
            res.status(200).json({Success:true,Message : 'Token in Valid', responseCode : 200});
      });

router.route(`/isvalidcred`)
      .post(isValidCred);

router.route(`/`)
      .get(protect, getUsers)
      .post(addUser);

router.route(`/validateuserinfo`)
      .post(userRegistrationValidation, validateUser);

router.route(`/job`)
      .post(userJob);

router.route(`/:id`)
      .get(getUsers);

router.route(`/login`)
      .post(userLoginValidation, login);

router.route(`promotetorenter/:id`)
      .put(protect, promoteUserToRenter);



module.exports = router;