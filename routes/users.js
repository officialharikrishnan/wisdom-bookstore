const express = require('express');
const {
  landingPage, loginPage, signUpPage, signUpSubmit, loginSubmit, homePage,
  otpManager, sendOtp, veryfyOtp, logout, viewProduct, cartPage, cartAdd,
  changeQuantity, checkoutForm, currentAddress,
  checkoutFormSubmit, getProfile, viewOrders, cancelOrder, viewOrderProduct,
  editAccount, editAccountSubmit, shopBooks, filterBook, orderSuccess, verifyPayment, checkCoupon,
} = require('../controller/user-controller');
const { authorization, landingAuthorization } = require('../middlewares/tokenAuthentication');

const router = express.Router();

router.get('/', landingAuthorization, landingPage);
router.get('/login', loginPage);
router.get('/register', signUpPage);
router.post('/signup-submit', signUpSubmit);
router.get('/otp', otpManager);
router.post('/login-submit', loginSubmit);
router.get('/home', authorization, homePage);
router.post('/number-submit', sendOtp);
router.post('/verify', veryfyOtp);
router.get('/view-product/:id', authorization, viewProduct);
router.post('/add-to-cart', authorization, cartAdd);
router.get('/cart', authorization, cartPage);
router.post('/change-product-quantity', authorization, changeQuantity);
router.get('/checkout', authorization, checkoutForm);
router.get('/get-current-address', authorization, currentAddress);
router.get('/account', authorization, getProfile);
router.post('/checkout-submit', authorization, checkoutFormSubmit);
router.post('/verify-payment', verifyPayment);
router.get('/order-success', authorization, orderSuccess);
router.get('/view-orders', authorization, viewOrders);
router.get('/view-user-order-product/:id', authorization, viewOrderProduct);
router.post('/cancel-order/', authorization, cancelOrder);
router.get('/edit-account', authorization, editAccount);
router.post('/edit-address', authorization, editAccountSubmit);
router.get('/shop-books', authorization, shopBooks);
router.post('/filter-book', authorization, filterBook);
router.post('/checkcoupon',authorization,checkCoupon) 
router.get('/logout', logout);

module.exports = router;
