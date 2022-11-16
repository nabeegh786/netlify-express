var nodemailer = require('nodemailer');

exports.sendEmail = async function(email,subject,body){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user:'sp19bscs0007@maju.edu.pk',
            pass:'Nabeegh123'
        }
    });

    var mailOptions =  {
        from : 'RentWheels',
        to: email,
        subject: subject,
        text: body
    }
    
    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
}

