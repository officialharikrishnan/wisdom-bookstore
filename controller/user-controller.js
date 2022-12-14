const { getAllBooks, userLogin, userSignup, findByNumber, viewBook, addToCart, getCart } = require("../model/user-helpers");
const { tockenGenerator, tokenVerify } = require("../utils/token");
var jwt = require('jsonwebtoken');
// require('dotenv').config()
// const {tockenGenerator}= require('../utils')
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
var number;
var jwtotpuser={name:'',id:""}


    function landingPage(req, res){
        getAllBooks().then((data) => {
            console.log(data);
            res.render('userView/landingPage', { data });
        })
            .catch(() => {
                console.log("failed to load books");
            })
    }
    function loginPage (req, res){
        res.render('userView/login');
    }
    function signUpPage (req, res)  {
        res.render('userView/register');
    }
    function signUpSubmit (req, res){
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
    }
    function otpManager  (req, res){
        res.render('userView/otpPage')
    }
    function loginSubmit  (req, res){
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
    }
     function homePage (req, res){
        var decode = tokenVerify(req)
        getAllBooks().then((data) => {
            console.log(data);
            res.render('userView/userHome',{data,user:decode.value.name});
        }).catch(() => {
                console.log("failed to load books");
            })
    } 
    function sendOtp (req, res) {
        console.log(req.body.number);
        number = req.body.number
        if(number.substring(0,3) != '+91'){
            number='+91'+number
        } 
        //accound finding
        findByNumber(number).then((user) => {
            console.log(user);
            jwtotpuser.name=user.username
            jwtotpuser.id=user._id
            client.verify
                .services(process.env.SERVICE_ID)
                .verifications.create({
                    to: number,
                    channel: "sms"
                })
                .then((resp) => {
                    res.render('userView/verifyPage')
                })
                .catch((err) => {
                    console.log(err);
                })  
        })
        .catch(() => {
            res.render('userView/otpPage', { error: "account not found" })
        })
        res.render('userView/verifyPage')

    }
    function veryfyOtp  (req, res) {
        console.log(req.body.otp);
        client.verify
            .services(process.env.SERVICE_ID)
            .verificationChecks.create({
                to: `+${number}`,
                code: req.body.otp
            }).then(async(data) => {
                if (data.status == "approved") {
                    const token =await tockenGenerator(jwtotpuser)
                    res.cookie("wisdom", token, {
                       httpOnly: true
                   }).redirect('/home')
                } else {
                    console.log("OTP not matched");
                    res.render('userView/verifyPage', { error: 'invalied OTP' })
                }
            })
        // const token = tockenGenerator(jwtotpuser)
        //             res.cookie("wisdom", token, {
        //                httpOnly: true
        //            }).redirect('/home')
    }
    function viewProduct (req,res){
        var decode = tokenVerify(req)
        viewBook(req.params.id).then((book)=>{
            res.render('userView/view-product',{isUser:decode.value.name,book})
        }).catch(()=>{
            console.log('failed to load viewbook');
        })
    }
    function cartPage(req,res){
        var decode = tokenVerify(req)
        getCart(decode.value.id).then((cart)=>{
            console.log(cart);
            res.render('userView/cart',{isUser:decode.value.name,cart})
        })

    }
    function logout (req, res) {
         res.cookie('wisdom','',{ expiresIn: '0.1s' })
         .redirect('/')
    }
    function cartAdd(req,res){
        console.log(req.params.id);
        var decode = tokenVerify(req)
        addToCart(req.params.id,decode.value.id).then(()=>{
            res.redirect(`/view-product/${req.params.id}`)
        })
    }
    function getCartItems(req,res){
        getCart('6399c50a5559a4ef410b15d7')
    }

module.exports={getCartItems,cartPage,cartAdd,landingPage,loginPage,signUpPage,signUpSubmit,otpManager,loginSubmit,homePage,sendOtp,veryfyOtp,viewProduct,logout}