const asyncHandler = require('../middlewear/async');
const { User } = require('../models/User');
const { Booking } = require('../models/Booking');
const { Vehicle } = require('../models/Vehicle');







exports.getAppStatistics = asyncHandler(async (req, res, next) => {
  
      

      var totalusers = await User.count();

      var verifiedUsers = await User.find({isVerified: {$eq : true}}).count();

      var newUsers = await countCurrentWeekDocuments(User);

      var totalVehicles = await Vehicle.find({approvalStatus:{$eq : '2' }}).count();
      
      var newVehicles = await countCurrentWeekDocuments(Vehicle);
      
      var newBookings = await countCurrentWeekDocuments(Booking);

      var activeRentals = await Booking.find({rentalStatus:{$eq : '4'}}).count();

      var completedRentals = await Booking.find({rentalStatus:{$eq : '3'}}).count();

      var noOfBookingsEachMonth = await countBookingsByMonth();
      


      
      return res.status(200).json({Success:true,
        stats : 
        {
            totalusers              : totalusers       ? totalusers : 0,
            verifiedUsers           : verifiedUsers    ? verifiedUsers : 0,
            newUsers                : newUsers         ? newUsers : 0,
            totalApprovedVehicles   : totalVehicles    ? totalVehicles : 0,
            newVehicles             : newVehicles      ? newVehicles : 0,
            newBookings             : newBookings      ? newBookings : 0,
            activeRentals           : activeRentals    ? activeRentals : 0,
            completedRentals        : completedRentals ? completedRentals : 0,
            noOfBookingsEachMonth   : refactorResponse(noOfBookingsEachMonth)

         }, responseCode :200});


});

const Months = {
    
    '01' : 'January',
    '02' : 'Feburary',
    '03' : 'March',
    '04' : 'April',
    '05' : 'May',
    '06' : 'June',
    '07' : 'July',
    '08' : 'August',
    '09' : 'September',
    '10' : 'October',
    '11' : 'November',
    '12' : 'December',
    
}


function refactorResponse(array){
    var refactoredArray = [];
    array.map((item)=>{
        refactoredItem = {};
        splittedItems = item._id.split('-');
       
        refactoredItem['MonthIndex'] = splittedItems[1];
        refactoredItem['Month'] = Months[splittedItems[1]]+'-'+splittedItems[0]
        refactoredItem['noOfBookings'] = item.count
        refactoredArray.push(refactoredItem);
    });
    return refactoredArray = refactoredArray.reverse();
}

async function countCurrentWeekDocuments(Document) {
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - new Date().getDay()),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - new Date().getDay() + 7),
          },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ];
  
    const result = await Document.aggregate(pipeline);
    return result.length > 0 ?  result[0]?.count : 0;
  }
  
  
  


  async function countBookingsByMonth() {
    const pipeline = [
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt',
            },
          },
          count: { $sum: 1 },
        },
      },
    ];
  
    const result = await Booking.aggregate(pipeline);
    return result;
  }
  


