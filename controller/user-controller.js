const { getAllBooks, userLogin, userSignup, findByNumber, viewBook } = require("../model/user-helpers");
var jwt = require('jsonwebtoken');
require('dotenv').config()
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
var number;
module.exports = {

    authorization: (req, res, next) => {
        const token = req.cookies.wisdom;
        if (!token) {
            return res.render('userView/login');
        } else {
            try {
                const data = jwt.verify(token, process.env.JWT_KEY);
                if (data) {
                    next()
                } else {
                    res.render('userView/login')
                }
            } catch {
                return res.render('userView/login')
            }
        }
    },
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
        } else {
            userSignup(req.body)
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
            .then((response) => {
                var token = jwt.sign({ user: response }, process.env.JWT_KEY, { expiresIn: '5min' })
                 res.cookie("wisdom", token, {
                    httpOnly: true
                }).redirect('/home')
            })
            .catch((err) => {
                res.render('userView/login', { error: err.error })
            })
    },
    homePage: (req, res) => {
        var decode = jwt.verify(req.cookies.wisdom, process.env.JWT_KEY)
        console.log(">>>>>", decode);
        getAllBooks().then((data) => {
            console.log(data);
            res.render('userView/userHome', { user: decode.user.name, data });
        })
            .catch(() => {
                console.log("failed to load books");
            })
    },
    sendOtp: (req, res) => {
        console.log(req.body.number);
        number = req.body.number
        //accound finding
        findByNumber(number).then((user) => {
            console.log(user);
            client.verify
                .services(process.env.SERVICE_ID)
                .verifications.create({
                    to: `+${number}`,
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
                    res.render('userView/userHome')
                } else {
                    console.log("sorry");
                    res.render('userView/verifyPage', { error: 'invalied OTP' })
                }
            })
    },
    viewProduct:(req,res)=>{
        var decode = jwt.verify(req.cookies.wisdom, process.env.JWT_KEY)
        viewBook(req.params.id).then((book)=>{
            res.render('userView/view-product',{isUser:decode.user.name,book})
        }).catch(()=>{
            console.log('failed to load book');
        })
    }
    // logout: (req, res) => {
    //      req.cookies.wisdom = undefined
    //         res.redirect('/')
    // }

}