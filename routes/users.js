const express = require('express');
const { landingPage, loginPage, signUpPage, signUpSubmit, loginSubmit, homePage, otpManager, sendOtp, veryfyOtp, logout, viewProduct, cartPage, cartAdd } = require('../controller/user-controller');
const { authorization, landingAuthorization } = require('../middlewares/tokenAuthentication');
const router = express.Router();


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
router.get('/add-to-cart/:id',cartAdd)
router.get('/cart',authorization,cartPage)
router.get('/logout',logout)
module.exports = router;
 