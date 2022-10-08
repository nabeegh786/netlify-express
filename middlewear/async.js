const asyncHandller = fn => (req, res, next) => 
    Promise
        .resolve(fn(req, res, next))
        .catch(err => {
            console.log(err);
            res.status(500).json({Success:false,Message:`Error Occured in Method => [${req.originalUrl}]`,Error:err, responseCode : 500})})
//.replace('/api/v1','')

module.exports = asyncHandller;