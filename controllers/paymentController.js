const {Payment} = require('../models/Payment');
const {Wallet} = require('../models/Wallet');
const asyncHandler = require('../middlewear/async');







exports.getPayments = asyncHandler(async (req,res) => {

   let id = req.user._id;
   var walletBalance = await Wallet.findOne({user:id});
  // var payments = await Payment.find({ $and : {transactionId: { toUser : id} , completed : true}}).select('bookingId transactionId').populate({ path: 'transactionId', model: 'Transaction', select: 'amount transactionDate fromUser' }).populate('fromUser').select('username');
   var payments = await Payment.find({toUser : id , completed : true}).select('bookingId amount serviceCharges transactionDate').populate({ path: 'fromUser', model: 'User', select: 'username' });
  
   if(!walletBalance || !payments){
    return res.status(200).json({Success:true,Message : `no payments yet` , Payload : {walletBallance : 0 , Payments : []}, responseCode : 200});
   }

   return res.status(200).json({Success:true,Message : `Showing Payment History and Total Wallet Ballance`, Payload : {walletBalance : walletBalance.balance, payments: payments}, responseCode : 200});
   
});


//check if token expired  
var expired =  asyncHandler( (date, expiryDuration) => {

    var OtpDate =  date;
    var dateNow = new Date();
    var expiry = expiryDuration*60*1000;
    var difference = (dateNow - new Date(OtpDate));
    if(difference < expiry)
    {
   
        return true;

    }
    return false;
});


