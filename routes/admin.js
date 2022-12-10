var express = require('express');
const { adminLoginPage, adminLogin, adminDashboard, allUsersPage, userBlock, stocks, addStockPage, addStockSubmit, editBook, editBookSubmit, deleteBook, bannerEditPage, editBannerImage, bannerEditForm, viewCategory, deleteCategory, addNewCategory, editCategory, editcategorySubmit } = require('../controller/admin-controller');
var router = express.Router();

router.get('/',adminLoginPage)
router.post('/admin-login-submit',adminLogin)
router.get('/dashboard',adminDashboard)
router.get('/allusers',allUsersPage)
router.post('/blockmanager/:id',userBlock)
router.get('/stocks',stocks)
router.get('/add-stock-page',addStockPage)
router.post('/add-stock-submit',addStockSubmit)
router.get('/edit-book/:id',editBook)
router.post('/edit-book-submit/:id',editBookSubmit)
router.get('/delete-book/:id',deleteBook)
router.get('/edit-banner',bannerEditForm)
router.post('/banner-submit',editBannerImage)
router.get('/banner-edit-page',bannerEditPage)
router.get('/category',viewCategory)
router.post('/add-category',addNewCategory)
router.get('/edit-category/:id',editCategory)
router.post('/edit-category-submit/:id',editcategorySubmit)
router.get('/delete-category/:id',deleteCategory)
module.exports = router;
