const express = require('express');
const {
  adminLoginPage, adminLogin, adminDashboard, allUsersPage, userBlock,
  stocks, addStockPage, addStockSubmit, editBook, editBookSubmit, deleteBook,
  bannerEditPage, editBannerImage, bannerEditForm, viewCategory, deleteCategory,
  addNewCategory, editCategory, editcategorySubmit, adminLogout, getAllOrders,
  viewOrderProduct, cancelOrderAdmin, deliveryStatus, salesReport, revenueReport, getCoupon, addCoupon, codeGenerator, addCouponSubmit, deleteCoupon, couponEdit, couponEditSubmit, pdfReport, salesReportPage,
} = require('../controller/admin-controller');
const { adminAuthorization } = require('../middlewares/tokenAuthentication');

const router = express.Router();

router.get('/', adminLoginPage);
router.post('/admin-login-submit', adminLogin);
router.get('/dashboard', adminAuthorization, adminDashboard);
router.post('/reports', adminAuthorization, salesReport);
router.post('/revenue', adminAuthorization, revenueReport);
router.get('/allusers', adminAuthorization, allUsersPage);
router.post('/blockmanager/:id', adminAuthorization, userBlock);
router.get('/stocks', adminAuthorization, stocks);
router.get('/add-stock-page', adminAuthorization, addStockPage);
router.post('/add-stock-submit', adminAuthorization, addStockSubmit);
router.get('/edit-book/:id', adminAuthorization, editBook);
router.post('/edit-book-submit/:id', adminAuthorization, editBookSubmit);
router.post('/delete-book/:id', adminAuthorization, deleteBook);
router.get('/edit-banner', adminAuthorization, bannerEditForm);
router.post('/banner-submit', adminAuthorization, editBannerImage);
router.get('/banner-edit-page', adminAuthorization, bannerEditPage);
router.get('/category', adminAuthorization, viewCategory);
router.post('/add-category', adminAuthorization, addNewCategory);
router.get('/edit-category/:id', adminAuthorization, editCategory);
router.post('/edit-category-submit/:id', adminAuthorization, editcategorySubmit);
router.post('/delete-category/', adminAuthorization, deleteCategory);
router.get('/getallorders', adminAuthorization, getAllOrders);
router.get('/view-order-product/:id', adminAuthorization,viewOrderProduct);
router.post('/delivery-status', adminAuthorization,deliveryStatus);
router.get('/cancel-order/:id', cancelOrderAdmin);
router.get('/coupon',adminAuthorization,getCoupon)
router.get('/addcoupon',adminAuthorization,addCoupon)
router.get('/generatecode',adminAuthorization,codeGenerator)
router.post('/addcouponsubmit',adminAuthorization,addCouponSubmit)
router.get('/editcoupon/:id',adminAuthorization,couponEdit)
router.post('/deletecoupon',adminAuthorization,deleteCoupon)
router.post('/editcouponsubmit/:id',adminAuthorization, couponEditSubmit)
router.get('/get-report',adminAuthorization,pdfReport)
router.get('/sales-report',adminAuthorization,salesReportPage)
router.get('/logout', adminLogout);
module.exports = router;
