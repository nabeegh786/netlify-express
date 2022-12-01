const serviceAccount = require("./firebase.json");
const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

exports.sendNotification = async function(title,subTitle,fcm_token){
   
   
    var image = 'http://localhost:8000/public/images/vehicle-category/as-1669550580504-417054102.png';
      const tokens = [];
      tokens.push(fcm_token);
      admin.messaging().sendMulticast({
        tokens,
      notification: {
        title : title,
        body : subTitle,
        imageUrl : image

      },
    }).then((res)=>{
          console.log("RES ->>",res)
          // console.log(res.responses[0].error);
      })
      .catch((err)=>{
          console.log("RES ->>",err)}
          );

          
    // admin.messaging().sendMulticast({
    //   tokens,
    //   data: {
    //     notifee: JSON.stringify({
    //       body: 'This message was sent via FCM!',
    //       android: {
    //         channelId: 'default',
    //         actions: [
    //           {
    //             title: 'Mark as Read',
    //             pressAction: {
    //               id: 'read',
    //             },
    //           },
    //         ],
    //       },
    //     }),
    //   },
    // })
    // .then((res)=>{
    //     console.log("RES ->>",res)
    //     // console.log(res.responses[0].error);
    // })
    // .catch((err)=>{
    //     console.log("RES ->>",err)}
    //     );
   
 
  

}

