const express = require('express'); 
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

require('dotenv/config');


//Middlewares
app.use(cors());
app.options('*',cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use('/public',express.static(__dirname+'/public'));
app.use(cookieParser());

//environment vairables
const api = process.env.API_URL

//creating Routes
const usersRoute = require('./routes/users');
const vehiclesRoute = require('./routes/vehicles');
const bookingsRoute = require('./routes/bookings');
const reviews = require('./routes/reviews');
const otp = require('./routes/otp');


//using Routes
app.use(`${api}/users`,usersRoute);
app.use(`${api}/vehicles`,vehiclesRoute);
app.use(`${api}/bookings`,bookingsRoute);
app.use(`${api}/reviews`, reviews);
app.use(`${api}/otp`, otp);




//Database Connection
mongoose.connect(process.env.CONNECTON_STRING,{
    //must add in order to not get any error massages:
    useUnifiedTopology:true,
    useNewUrlParser: true,
    dbName :'eshop-databse',
}) 
.then(()=>{
    console.log('Database connection is ready');
})
.catch((err)=>{
    console.log(err);
})



//Server
app.listen(8000, () => {
    console.log(api);
    console.log('server is running on http://localhost:8000');
})






