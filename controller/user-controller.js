const { getAllBooks, userLogin, userSignup, findByNumber } = require("../model/user-helpers");
require('dotenv').config()
const client = require("twilio")(process.env.ACCOUNT_SID,process.env.AUTH_TOKEN);
var number;
module.exports = {


    landingPage: (req, res) => {
        getAllBooks().then((data) => {
            console.log(data);
            res.render('userView/landingPage', { data });
        })
            .catch(() => {
                console.log("failed to load books");
            })
    },
    loginPage: (req, res) => {
        res.render('userView/login');
    },
    signUpPage: (req, res) => {
        res.render('userView/register');
    },
    signUpSubmit: (req, res) => {
        if (!req.body.username || !req.body.email || !req.body.password || !req.body.phone) {
            res.render('userView/register', { error: "Enter details" })
        } else {
            userSignup(req.body)
                .then((response) => {
                    res.redirect('/home')
                })
        }
    },
    otpManager: (req, res) => {
        res.render('userView/otpPage')
    },
    loginSubmit: (req, res) => {
        userLogin(req.body)
            .then((response) => {
                res.redirect('/')
            })
            .catch((err) => {
                res.render('userView/login', { error: err.error })
            })
    },
    homePage: (req, res) => {
        getAllBooks().then((data) => {
            console.log(data);
            res.render('userView/userHome', { data });
        })
            .catch(() => {
                console.log("failed to load books");
            })
    },
    sendOtp: (req, res) => {
        console.log(req.body.number);
        number = req.body.number
        //accound finding
        findByNumber(number).then((user)=>{
            console.log(user);
            client.verify
            .services(process.env.SERVICE_ID)
            .verifications.create({
                to: `+${number}`,
                channel: "sms"
            })
            .then((resp) => {

                res.render('userView/verifyPage')
            }).catch((err)=>{
                console.log(err);
            })
        }).catch(()=>{
             res.render('userView/otpPage',{error:"account not found"})
        })
        
    },
    veryfyOtp: (req, res) => {
        console.log(req.body.otp);
        client.verify
            .services(process.env.SERVICE_ID)
            .verificationChecks.create({
                to: `+${number}`,
                code: req.body.otp
            }).then((data) => {
                if (data.status == "approved") {
                    console.log(">>>>>> success");
                    res.render('userView/userHome')
                } else {
                    console.log("?????sorry");
                    res.render('userView/verifyPage', { error: 'invalied OTP' })
                }
            })
    }

}