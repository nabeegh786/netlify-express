const asyncHandller = fn => (req, res, next) => 
    Promise
        .resolve(fn(req, res, next))
        .catch(error => {
            console.log(error);
            res.status(500).json({Success:true,Message:`Error Occured in Method => [${req.originalUrl}]`,ErrorMessage:error.message.toString(), ErrorStak : error.stack.toString(), responseCode : 500})})
//.replace('/api/v1','')

module.exports = asyncHandller;