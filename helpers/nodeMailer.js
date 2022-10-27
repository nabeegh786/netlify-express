var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{

        user:'nabeegh77mumtaz@gmail.com',
        pass:'Nabeegh123'
    }
});

var mailOptions =  {
    from : 'RentWheels',
    to:'sp19bscs0007@maju.edu.pk',
    subject:'test email',
    text:'test email'

}
// transporter.sendMail({
//     mailOptions, function(params) {
        
//     }
// });