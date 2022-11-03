var nodemailer = require('nodemailer');

const sendEmail = async options => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user:'sp19bscs0007@maju.edu.pk',
            pass:'Nabeegh123'
        }
    });

    var mailOptions =  {
        from : 'RentWheels',
        to:'nabeegh77mumtaz@gmail.com',
        subject:'test email',
        text:'Rentwheels test email'

    }
    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
}

module.exports = sendEmail;