const asyncHandller = fn => (req, res, next) => 
    Promise
        .resolve(fn(req, res, next))
        .catch(error => {
            console.log(error);
            res.status(500).json({Success:true,Message:`Error Occured in Method => [${req.originalUrl}]`,Error:error.toString(), responseCode : 500})})
//.replace('/api/v1','')

module.exports = asyncHandller;