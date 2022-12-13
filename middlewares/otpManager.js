// const { findByNumber } = require("../model/user-helpers");
// const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

//  function sendOtp(req, res){
//     console.log(req.body.number);
//     number = req.body.number
//     if(number.substring(0,3) != '+91'){
//         number='+91'+number
//     } 
//     //accound finding
//     findByNumber(number).then((user) => {
//         console.log(user);
//         jwtotpuser.user.name=user.username
//         client.verify
//             .services(process.env.SERVICE_ID)
//             .verifications.create({
//                 to: number,
//                 channel: "sms"
//             })
//             .then((resp) => {
//                 res.render('userView/verifyPage')
//             }).catch((err) => {
//                 console.log(err);
//             })
//     }).catch(() => {
//         res.render('userView/otpPage', { error: "account not found" })
//     })

// }
// function veryfyOtp(req, res){
//     console.log(req.body.otp);
//     client.verify
//         .services(process.env.SERVICE_ID)
//         .verificationChecks.create({
//             to: `+${number}`,
//             code: req.body.otp
//         }).then((data) => {
//             if (data.status == "approved") {
//                 console.log(">>>>>> success");
//                 tockenGenerator()
//                 res.cookie("wisdom", token, {
//                    httpOnly: true
//                }).redirect('/home')
//             } else {
//                 console.log("sorry");
//                 res.render('userView/verifyPage', { error: 'invalied OTP' })
//             }
//         })
// }
// module.exports = {
//     sendOtp , veryfyOtp
// }