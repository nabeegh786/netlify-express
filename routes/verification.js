const express = require('express');
const {
    verifyUser,
    isVerified } = require('../controllers/verificationController');

const compare = require('../middlewear/faceComparision');
const { userVerificationStorage } = require('../middlewear/multerStorage')

const multer = require('multer');

const uploadOptionsUserVerification = multer({storage: userVerificationStorage});

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middlewear/advancedResults');
const { protect, authorize } = require('../middlewear/auth');

const { verifyUserValidation} = require('../middlewear/validator');

const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

router.route(`/verifyuser`) 
    .post((req,res,next) => {
        
        uploadOptionsUserVerification.fields(
                [
                    {
                        name:'cnicFront',
                        maxCount:1
                    },
                    {
                        name: 'cnicBack',
                        maxCount:1
                    },
                    {
                        name: 'licenseFront',
                        maxCount:1
                    },
                    {
                        name:'licenseBack',
                        maxCount:1
                    },
                    {
                        name: 'utilityBill',
                        maxCount:1
                    },
                    {
                        name: 'image',
                        maxCount:1
                    }
                ]
                    )(req, res, function (err) {
        if (err instanceof multer.MulterError) {
                if(err.message === 'Unexpected field'){
                        var code = err.code;
                        // if(code === 'LIMIT_UNEXPECTED_FILE')
                        //        return res.status(400).json({Success:false,Message:`Ashu saley tune image ghalat fieldName se bheji hai spelling check kr sahi se (images, vehiclePapers, vehicleInsurance) yeh teen hai`, responseCode : 400, errorCode : code});
                        return res.status(500).json({Success:false,Message:'upload images failed for user verification', responseCode : 400, errorCode : code});
                }
                // A Multer error occurred   when uploading
                return res.status(500).json({Success:false,Message:err.message, responseCode : 500});
        } else if (err) {
                // An unknown error occurred when uploading.
                return res.status(400).json({Success:false,Message:err.message, responseCode : 400});      
        }
        // Everything went fine.
        next();
        })
}
,
protect,authorize('user'),
// verifyUserValidation,
// compare,

 verifyUser)



 router.route(`/isverified`) 
 .get(protect,authorize('user'),isVerified);

module.exports = router;
