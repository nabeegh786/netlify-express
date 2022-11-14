const Moment = require('moment');

const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'filter'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

   Object.keys(reqQuery).map((element) => {
     if(reqQuery[element] == ''){
      delete reqQuery[element]
     }else if(typeof(reqQuery[element]) == 'object'){
       var obj = reqQuery[element];
      Object.keys(obj).map((nestedelement) => {
         if(obj[nestedelement] == ''){
          delete obj[nestedelement]
         }
       });
       reqQuery[element] = obj;
       if(JSON.stringify(obj)==='{}'){
        delete reqQuery[element]
       }
     }
     
   });

     
  if(typeof(reqQuery["pickupLocation"]) != "undefined"){
     if(reqQuery["pickupLocation"].includes(",")){
      var coordinates  = reqQuery["pickupLocation"].split(",");
      const latitude = Number(coordinates[0].trim());
      const longitude = Number(coordinates[1].trim());
      if(checkLatitude(latitude) && checkLongitude(longitude)){
      reqQuery["pickupLocation"] =  {  $geoWithin:{ $centerSphere: [ [longitude,latitude], 5 / 6378.1 ] }}
      }else{
        delete reqQuery["pickupLocation"]
      }
     }else{
      delete reqQuery["pickupLocation"]
    } 
  }

  //{$and: [ {_id : req.query.vehicle}, { startTime: { $gt: currentDate } } , { rentalStatus : { $ne : '2' } }]}

  if(req.query.dates){
    let start = new Date();
    start.setHours(0,0,0,0);
    let date = Moment(start).format('YYYY-MM-DD');
    reqQuery["startTime"] =  { gte: date } ;
    reqQuery["rentalStatus"] = { $ne : '2' };
  }



  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  //,CVAS-007
  //{registrationNumber:["BVAS-007","CVAS-007"]}
  //{registrationNumber:{$in:["BVAS-007","CVAS-007"]}}
  // Finding resource


  
  query = model.find(JSON.parse(queryStr));

  query2 = model.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

 
  // filter Fields
  if (req.query.filter) {
    // query = query.find({ $and: [ { registrationNumber : ["BVAS-007","CVAS-007","NILE-007"]}, { noOfDoors : ["0","2"] } ] });
    if (req.query.filter.includes('||')) {
      const fieldsWithValues = req.query.filter.split('||');
      var obj = [];
      fieldsWithValues.map(field => {
        item = {};
        var index = field.split("=");
        var fieldName = index[0];
        var fieldValue = index[1].split(',');
        item[fieldName] = fieldValue;
        obj.push(item);
        

      });
      query = query.find({ $and: obj });
    }

    else if (req.query.filter.includes('|')) {
      const fieldsWithValues = req.query.filter.split('|');
      var obj = [];
      fieldsWithValues.map(field => {
        item = {};
        var index = field.split("=");
        var fieldName = index[0];
        var fieldValue = index[1].split(',');
        item[fieldName] = fieldValue;
        obj.push(item);

      });

      query = query.find({ $or: obj });
    }
    else{
 
        var index = req.query.filter.split("=");
        var fieldName = index[0];
        var fieldValue = index[1].split(',');
    
        query = query.find({[fieldName]:fieldValue});
    }
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy)
  } else {
    query = query.sort('-createdAt');
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();


  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }


  // Executing query
  const results = await query;
  const totalCountQuery = await query2.countDocuments();
  
  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    total : totalCountQuery,
    count: results.length,
    pagination,
    data: results
  };

  next();
};
const checkLatitude = (latitude) => {
  return isFinite(latitude) && Math.abs(latitude) <= 90;
};

const checkLongitude = (longitude) => {
  return isFinite(longitude) && Math.abs(longitude) <= 180;
};
module.exports = advancedResults;