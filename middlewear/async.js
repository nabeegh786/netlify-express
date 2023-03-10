const asyncHandller = fn => (req, res, next) => 
    Promise
        .resolve(fn(req, res, next))
        .catch(error => {
            console.log(error);
            res.status(500).json({Success:false,Message:`Error Occured in Method => [${req.originalUrl}]`,ErrorMessage:error.message.toString(), ErrorStack : error.stack.toString(), responseCode : 500})})
//.replace('/api/v1','')

module.exports = asyncHandller;