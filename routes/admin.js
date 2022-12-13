const express = require('express');
const { adminLoginPage, adminLogin, adminDashboard, allUsersPage, userBlock, stocks, addStockPage, addStockSubmit, editBook, editBookSubmit, deleteBook, bannerEditPage, editBannerImage, bannerEditForm, viewCategory, deleteCategory, addNewCategory, editCategory, editcategorySubmit, adminAuthorization, adminLogout } = require('../controller/admin-controller');
const router = express.Router();

router.get('/',adminLoginPage)
router.post('/admin-login-submit',adminLogin)
router.get('/dashboard',adminAuthorization,adminDashboard)
router.get('/allusers',adminAuthorization,allUsersPage)
router.post('/blockmanager/:id',adminAuthorization,userBlock)
router.get('/stocks',adminAuthorization,stocks)
router.get('/add-stock-page',adminAuthorization,addStockPage)
router.post('/add-stock-submit',adminAuthorization,addStockSubmit)
router.get('/edit-book/:id',adminAuthorization,editBook)
router.post('/edit-book-submit/:id',adminAuthorization,editBookSubmit)
router.get('/delete-book/:id',adminAuthorization,deleteBook)
router.get('/edit-banner',adminAuthorization,bannerEditForm)
router.post('/banner-submit',adminAuthorization,editBannerImage)
router.get('/banner-edit-page',adminAuthorization,bannerEditPage)
router.get('/category',adminAuthorization,viewCategory)
router.post('/add-category',adminAuthorization,addNewCategory)
router.get('/edit-category/:id',adminAuthorization,editCategory)
router.post('/edit-category-submit/:id',adminAuthorization,editcategorySubmit)
router.get('/delete-category/:id',adminAuthorization,deleteCategory)
router.get('/logout',adminLogout)
module.exports = router;
