const  jwt  = require('jsonwebtoken');
const {User} = require('../models/User');
require('dotenv/config');
const jwtsecret = process.env.JWT_SECRET;

//Protect the routes, only the users with authentic Token can access Protected routes
exports.protect = async (req, res, next) =>{
    try {
        //Get auth Header Value
        const bearerHeader  = req.headers['authorization'];
        //Check if Header is undefined or not
        if(typeof(bearerHeader) !== 'undefined')
        {
            
            //Token Format =  Bearer XCDSFSSVSBWTJGMYUDSEFA$#%%#%#TSFDF#%$RD
            //Split at space
            const bearerToken = bearerHeader.split(' ')[1];

            //verify the jwt token  
            const decoded = await jwt.verify(bearerToken, jwtsecret);

            //store user id of token in request object
            req.user = await User.findById(decoded.user._id);

            //Call the next middlewear
            next();
        }
        else
        {
            //Forbidden
            return res.status(403).json({Success :false , Message :'Not authorized to access this route', responseCode : 403});
        
        }
        } catch (error) 
        {
            //Forbidden
            return res.status(403).json({Success :false , Message :'Not authorized to access this route', responseCode : 403});
        
        }
   
};


// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
       return res.status(403).json({Success :false , Message : `User role ${req.user.role} is not authorized to access this route`, responseCode : 403});
     }
      next();
    };
  };
