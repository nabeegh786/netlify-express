const fetch = require('node-fetch');

exports.sendNotification = async function(title,subTitle,fcm_token){
   
    var notification =  {
        'title' : title,
        'text' : subTitle
    }
    
    var fcm_tokens = [fcm_token];

    var notificationBody = {
        'notification' : notification,
        'registration_ids' : fcm_tokens
    };

    fetch('https://fcm.googleapis.com/fcm/send',{
        'method' : 'POST',
        'headers':{
            'Authorization'   : 'key='+'AAAAJnmrQfs:APA91bFS66ul1p5kW0GS6ma6qca4DlBwm_Vx1DOIaf5UOq-58vVQ9x7WWcKgH9VWQrw70rug0JiiRVPuKMUQ17Qiu7MOFIQZk-I5R3mAXn51Wt1lKJK6pReIXxBFPTgObFkZT4Q5GlGJ',
            'Content-Type' : 'application/json'
        },
        'body':JSON.stringify(notificationBody)

    }).then((msg)=>{
        console.log("res >>",msg);
    }).catch((err)=>{
        console.log(err);
    })

}

