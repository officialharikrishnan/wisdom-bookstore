var express = require('express');
const { landingPage, loginPage, signUpPage, signUpSubmit, loginSubmit, homePage, otpManager, sendOtp, veryfyOtp } = require('../controller/user-controller');
var router = express.Router();


router.get('/', landingPage);
router.get('/login', loginPage);
router.get('/register', signUpPage);
router.post('/signup-submit',signUpSubmit)
router.get('/otp',otpManager)
router.post('/login-submit',loginSubmit)
router.get('/home',homePage)
router.post('/number-submit',sendOtp)
router.post('/verify',veryfyOtp)
module.exports = router;
