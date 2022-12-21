const {
  adminDoLogin, getAllUsers, userBlockManage, addStock, getAllStocks, getBook,
  doEditBook, removeBook, getBanner, category, addCategory,
  removeCategory, editCategorySub, deleteByCategory, updateBookCategory, AllOrders,
  viewSingleOrder, cancelOrderAdminSubmit, deliveryStatusChange, totalusers, getDailyOrder, getDailySales,
} = require('../model/admin-helpers');
const { adminTokenGenerator } = require('../utils/token');
require('dotenv').config();

let error;
const btnstatus = {};
let categorydata;

function adminLoginPage(req, res) {
  res.render('adminView/login');
}
function adminLogin(req, res) {
  adminDoLogin(req.body).then(async (data) => {
    console.log(data);
    const token = await adminTokenGenerator(data);
    res.cookie('auth', token, {
      httpOnly: true,
    }).redirect('/admin/dashboard');
  }).catch((err) => {
    res.render('adminView/login', { error: err.error });
  });
}
async function adminDashboard(req, res) {
  const sales = await getDailySales()
  const daily = await getDailyOrder();
  const users = await totalusers();
  res.render('adminView/dashboard', { admin: true, count: daily.length, users: users.length, sales });
}
function allUsersPage(req, res) {
  getAllUsers().then((users) => {
    res.render('adminView/allUsers', { admin: true, users });
  }).catch(() => {
    console.log('get all user error');
  });
}
function userBlock(req, res) {
  console.log(req.params.id);
  console.log(req.body);
  userBlockManage(req.body.id, req.params.id).then(() => {
    res.redirect('/admin/allusers');
  });
}
function stocks(req, res) {
  getAllStocks().then((books) => {
    console.log('>>>>>>>>>>>>>', books);
    res.render('adminView/stocks', { admin: true, books });
  }).catch(() => {
    console.log('get stock error');
  });
}
function addStockPage(req, res) {
  category().then((data) => {
    res.render('adminView/add-stock', { admin: true, data });
  });
}
function addStockSubmit(req, res) {
  const image = req.files.Image;
  console.log(req.body);
  addStock(req.body).then((data) => {
    console.log(req.files);
    image.mv(`./public/book-image/${data.id}.jpg`, (err, done) => {
      if (err) {
        console.log(err);
      } else {
        console.log(done);
        res.redirect('/admin/add-stock-page');
      }
    });
  }).catch((err) => {
    console.log(err);
  });
}
function editBook(req, res) {
  let categdata;
  category().then((data) => {
    categdata = data;
  });
  getBook(req.params.id).then((book) => {
    res.render('adminView/editBook', { book, admin: true, categdata });
  })
    .catch(() => {
      console.log('no book found');
    });
}
function editBookSubmit(req, res) {
  const { id } = req.params;
  doEditBook(req.body, req.params.id).then(() => {
    if (req.files?.Image) {
      const image = req.files.Image;
      image.mv(`./public/book-image/${id}.jpg`);
    }
    res.redirect('/admin/stocks');
  }).catch((err) => {
    console.log(err);
  });
}
function deleteBook(req, res) {
  removeBook(req.params.id, req.body.id).then(() => {
    res.redirect('/admin/stocks');
  });
}
function bannerEditForm(req, res) {
  res.render('adminView/edit-banner', { admin: true });
}
function bannerEditPage(req, res) {
  getBanner().then((response) => {
    console.log(response);
    res.render('adminView/banners', { admin: true, response });
  });
}
function editBannerImage(req, res) {
  if (req.files.left) req.files.left.mv('./public/banners/w4tgc5qflbgqr3um.jpg');
  if (req.files.middle) req.files.middle.mv('./public/banners/w4tgc5qflbgqr3un.jpg');
  if (req.files.right) req.files.right.mv('./public/banners/w4tgc5qflbgqr3uo.jpg');
  res.redirect('/admin/banner-edit-page');
}
function viewCategory(req, res) {
  category().then((data) => {
    categorydata = data;
    btnstatus.btn = 'add';
    btnstatus.link = false;
    btnstatus.text = 'Add new Category';
    btnstatus.route = 'add-category';
    res.render('adminView/viewCategory', {
      admin: true, categorydata, error, btnstatus,
    });
  });
}
function addNewCategory(req, res) {
  if (!req.body.name) {
    error = 'Enter category';
    res.redirect('/admin/category');
  } else {
    addCategory(req.body.name).then(() => {
      error = '';
      res.redirect('/admin/category');
    }).catch(() => {
      error = 'Category already exists';
      res.redirect('/admin/category');
    });
  }
}
function editCategory(req, res) {
  btnstatus.btn = 'Edit';
  btnstatus.link = true;
  btnstatus.text = 'Edit Category';
  btnstatus.route = `edit-category-submit/${req.params.id}`;
  res.render('adminView/viewCategory', {
    admin: true, categorydata, error, btnstatus,
  });
}
function editcategorySubmit(req, res) {
  editCategorySub(req.params.id, req.body.name).then((old) => {
    updateBookCategory(old, req.body.name);
    res.redirect('/admin/category');
  });
}
function deleteCategory(req, res) {
  removeCategory(req.body.data).then((data) => {
    deleteByCategory(data);
    res.redirect('/admin/category');
  });
}
function adminLogout(req, res) {
  res.cookie('auth', '', { expiresIn: '0.1s' })
    .redirect('/admin');
}
async function getAllOrders(req, res) {
  AllOrders().then((orders) => {
    res.render('adminView/viewAllOrders', { admin: true, orders });
  }).catch(() => {
    res.render('adminView/viewAllOrders', { admin: true, message: 'No orders' });
  });
}
function viewOrderProduct(req, res) {
  viewSingleOrder(req.params.id).then((products) => {
    res.render('adminView/viewOrderProduct', { admin: true, products });
  }).catch(() => {

  });
}
function cancelOrderAdmin(req, res) {
  cancelOrderAdminSubmit(req.params.id).then(() => {
    res.redirect('/admin/getallorders');
  });
}
function deliveryStatus(req, res) {
  console.log('called');
  deliveryStatusChange(req.body.id, req.body.status).then(() => {
    res.redirect('/admin/getallorders');
  }).catch(() => {
    console.log('failed to change delivery status');
  });
}

module.exports = {
  deliveryStatus,
  cancelOrderAdmin,
  viewOrderProduct,
  getAllOrders,
  adminLoginPage,
  adminDashboard,
  allUsersPage,
  userBlock,
  adminLogin,
  stocks,
  addStockPage,
  addStockSubmit,
  editBook,
  editBookSubmit,
  deleteBook,
  bannerEditForm,
  bannerEditPage,
  editBannerImage,
  viewCategory,
  addNewCategory,
  editCategory,
  editcategorySubmit,
  deleteCategory,
  adminLogout,
};
