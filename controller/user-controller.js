const { getAllBooks, userLogin, userSignup, findByNumber, viewBook, userBlockCheck } = require("../model/user-helpers");
const { tockenGenerator, tokenVerify } = require("../utils/token");
var jwt = require('jsonwebtoken');
// require('dotenv').config()
// const {tockenGenerator}= require('../utils')
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
var number;
var jwtotpuser={user:{}}
module.exports = {

   
    landingAuthorization: (req, res, next) => {
        const token = req.cookies.wisdom;
        if (!token) {
            next()
        } else {
            try {
                const data = jwt.verify(token, process.env.JWT_KEY);
                if (data) {
                    res.redirect('/home')
                } else {
                    next()
                }
            } catch {
                next()
            }
        }
    },

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
        }else if(!req.body.pass){
            res.render('userView/register', { error: "please enter confirm password" })
        }
         else {
            let userData={
                username:req.body.username,
                email:req.body.email,
                password:req.body.password,
                phone:req.body.phone
            }
            userSignup(userData)
                .then((response) => {
                    var token = jwt.sign({ user: response }, process.env.JWT_KEY, { expiresIn: '5min' })
                     res.cookie("wisdom", token, {
                        httpOnly: true
                    }).redirect('/home')
                }).catch((err)=>{
                    res.render('userView/register',{error:err.error})
                })
        }
    },
    otpManager: (req, res) => {
        res.render('userView/otpPage')
    },
    loginSubmit: (req, res) => {
        userLogin(req.body)
            .then(async(response) => {

                var token =await tockenGenerator(response)
                 res.cookie("wisdom", token, {
                    httpOnly: true
                }).redirect('/home')
            })
            .catch((err) => {
                res.render('userView/login', { error: err.error })
            })
    },
    homePage: (req, res) => {
        var decode = tokenVerify(req)
        getAllBooks().then((data) => {
            console.log(data);
            res.render('userView/userHome',{data,user:decode.value.name});
        }).catch(() => {
                console.log("failed to load books");
            })
    }, 
    sendOtp: (req, res) => {
        console.log(req.body.number);
        number = req.body.number
        if(number.substring(0,3) != '+91'){
            number='+91'+number
        } 
        //accound finding
        findByNumber(number).then((user) => {
            console.log(user);
            jwtotpuser.user.name=user.username
            client.verify
                .services(process.env.SERVICE_ID)
                .verifications.create({
                    to: number,
                    channel: "sms"
                })
                .then((resp) => {

                    res.render('userView/verifyPage')
                }).catch((err) => {
                    console.log(err);
                })
        }).catch(() => {
            res.render('userView/otpPage', { error: "account not found" })
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
                    var token = jwt.sign({ user: jwtotpuser.user }, process.env.JWT_KEY, { expiresIn: '5min' })
                    res.cookie("wisdom", token, {
                       httpOnly: true
                   }).redirect('/home')
                } else {
                    console.log("sorry");
                    res.render('userView/verifyPage', { error: 'invalied OTP' })
                }
            })
    },
    viewProduct:(req,res)=>{
        var decode = tokenVerify(req)
        viewBook(req.params.id).then((book)=>{
            res.render('userView/view-product',{isUser:decode.value.name,book})
        }).catch(()=>{
            console.log('failed to load book');
        })
    },
    logout: (req, res) => {
         res.cookie('wisdom','',{ expiresIn: '0.1s' })
         .redirect('/')
    }

}