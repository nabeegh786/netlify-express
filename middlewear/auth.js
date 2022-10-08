const  jwt  = require('jsonwebtoken');
require('dotenv/config');
const jwtsecret = process.env.JWT_SECRET;

const protect = async (req, res, next) =>{
    try {
        //Get auth Header Value
        const bearerHeader  = req.headers['authorization'];
        //Check if Header is undefined
        if(typeof(bearerHeader) !== 'undefined'){
            //Token Format =  Bearer XCDSFSSVSBWTJGMYUDSEFA$#%%#%#TSFDF#%$RD
            //Split at space
            const bearerToken = bearerHeader.split(' ')[1];
            //Set the Token
            //req.token = bearerToken;
            //verify the jwt token  
            await jwt.verify(bearerToken, jwtsecret);
            //Call the next middlewear
            next();
        }else{
            //Forbidden
            return res.status(403).json({Success :false , Message :'You are Unauthorized to access this resource', responseCode : 403});
        }
    } catch (error) {

        if(error.name === 'TokenExpiredError'){
            return res.status(403).json({Success :false , Message :'Token Expired, You are Unauthorized to access this resource', responseCode : 403});
         }
         if(error.name === 'JsonWebTokenError'){
            return res.status(403).json({Success :false , Message :'Invalid Token, You are Unauthorized to access this resource', responseCode : 403});
         }
         return res.status(403).json({Success :false , Message :'UnAuthorized', responseCode : 403});
     }
   
};

module.exports = protect;