
const setCookie = function(key, value, req, res){
    try {
        if(req.secure){
            res.cookie(  key,
            value,
            {
             maxAge   : 5000,
             secure   : true,
             httpOnly : true,
             sameSite : 'lax'
            }
        );
        }else{
            res.cookie(  key,   
            value,
            {
             maxAge   : 5000,
             secure   : false,
             httpOnly : true,
             sameSite : 'lax'
            }
        );
        }
       
    } catch (error) {
        res.status(500).json({Success:false,Message:'Error in => [SetCookie] Cookie not generated',Error:error, responseCode : 500});
    }
}

module.exports = setCookie;