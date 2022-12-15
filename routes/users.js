const express = require('express');
const { landingPage, loginPage, signUpPage, signUpSubmit, loginSubmit, homePage, otpManager, sendOtp, veryfyOtp, logout, viewProduct, cartPage, cartAdd, changeQuantity, totelPrice, checkoutForm, checkoutSubmit, currentAddress, checkoutFormSubmit, getProfile } = require('../controller/user-controller');
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
router.get('/add-to-cart/:id',authorization,cartAdd)
router.get('/cart',authorization,cartPage)
router.post('/change-product-quantity',authorization,changeQuantity)
router.get('/checkout',authorization,checkoutForm)
router.get('/get-current-address',currentAddress)
router.get('/account',authorization,getProfile)
router.post('/checkout-submit',authorization,checkoutFormSubmit)
router.get('/logout',logout)
module.exports = router;
 