var express = require('express');
const { landingPage, loginPage, signUpPage, signUpSubmit, loginSubmit, homePage, otpManager, sendOtp, veryfyOtp, authorization, logout, viewProduct, landingAuthorization } = require('../controller/user-controller');
var router = express.Router();


router.get('/',landingAuthorization, landingPage);
router.get('/login', loginPage);
router.get('/register', signUpPage);
router.post('/signup-submit',signUpSubmit)
router.get('/otp',otpManager)
router.post('/login-submit',loginSubmit)
router.get('/home',authorization,homePage)
router.post('/number-submit',sendOtp)
router.post('/verify',veryfyOtp)
router.get('/view-product/:id',authorization,viewProduct)
router.get('/logout',logout)
module.exports = router;
