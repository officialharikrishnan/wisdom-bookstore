const { tockenGenerator, tokenVerify } = require('../utils/token');
// eslint-disable-next-line import/order
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const { cartBooks, getTotalPrice } = require('../utils/getcartbooks');
const {
  getAllBooks, userLogin, userSignup, findByNumber, viewBook, addToCart,
  changeBookQuantity, loadCurrentAddress, getAccountInfo,
  getCartProducts, placeOrder, removeCartAfterOrder, getOrderProductToOrder,
  cancelOrderSubmit, userAllOrders, viewSingleUserOrder,
  editAddress, categoryUser, filterByCategory, generateRazorpay,
  paymentVerification, OrderStatusChange, couponManage, productReturn, getAllCoupons, bookSearch,
} = require('../model/user-helpers');
let number;
let filterStatus = false;
let books;
let catg;
let mode;
let successAmount;
let loginStat = false;
const jwtotpuser = { name: '', id: '' };

function landingPage(req, res) {
  getAllBooks().then((data) => {
    res.render('userView/landingPage', { data, landing: true });
  })
    .catch(() => {
      console.log('failed to load books');
    });
}
function loginPage(req, res) {
  res.render('userView/login');
}
function signUpPage(req, res) {
  res.render('userView/register');
}
function signUpSubmit(req, res) {
  if (!req.body.username || !req.body.email || !req.body.password || !req.body.phone) {
    res.render('userView/register', { error: 'Enter details' });
  } else if (!req.body.pass) {
    res.render('userView/register', { error: 'please enter confirm password' });
  } else {
    const userData = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
    };
    userSignup(userData)
      .then(async (response) => {
        loginStat = true
        const token = await tockenGenerator(response);
        res.cookie('wisdom', token, {
          httpOnly: true,
        }).redirect('/home');
      }).catch((err) => {
        res.render('userView/register', { error: err.error });
      });
  }
}
function otpManager(req, res) {
  res.render('userView/otpPage');
}
function loginSubmit(req, res) {
  userLogin(req.body)
    .then(async (response) => {
      loginStat = true
      const token = await tockenGenerator(response);
      res.cookie('wisdom', token, {
        httpOnly: true,
      }).redirect('/home');
    })
    .catch((err) => {
      res.render('userView/login', { error: err.error });
    });
}
function homePage(req, res) {
  const decode = tokenVerify(req);
  getAllBooks().then(async (data) => {
    const cart = await cartBooks(req);
    const total = await getTotalPrice(req);
    res.render('userView/userHome', {
      data, user: decode.value.name, cart, total,
    });
  }).catch(() => {
    console.log('failed to load books');
  });
}
function sendOtp(req, res) {
  number = req.body.number;
  if (number.substring(0, 3) !== '+91') {
    number = `+91${number}`;
  }
  // accound finding
  findByNumber(number).then((user) => {
    jwtotpuser.name = user.username;
    // eslint-disable-next-line no-underscore-dangle
    jwtotpuser.id = user._id;
    client.verify
      .services(process.env.SERVICE_ID)
      .verifications.create({
        to: number,
        channel: 'sms',
      })
      .then(() => {
        res.render('userView/verifyPage');
      })
      .catch((err) => {
        console.log(err);
      });
  })
    .catch((err) => {
      res.render('userView/otpPage', { error: err });
    });
}
function veryfyOtp(req, res) {
  client.verify
    .services(process.env.SERVICE_ID)
    .verificationChecks.create({
      to: `+${number}`,
      code: req.body.otp,
    }).then(async (data) => {
      if (data.status === 'approved') {
        const token = await tockenGenerator(jwtotpuser);
        res.cookie('wisdom', token, {
          httpOnly: true,
        }).redirect('/home');
      } else {
        console.log('OTP not matched');
        res.render('userView/verifyPage', { error: 'invalied OTP' });
      }
    });
}
function viewProduct(req, res) {
 if(loginStat){
  const decode = tokenVerify(req);
  viewBook(req.params.id).then(async (book) => {
    const cart = await cartBooks(req);
    const total = await getTotalPrice(req);
    res.render('userView/view-product', {
      user: decode.value.name, book, cart, total,
    });
  }).catch(() => {
    console.log('failed to load viewbook');
  });
 }else{
  viewBook(req.params.id).then(async (book) => {
    res.render('userView/view-product', {
       book,user:'Login',guest:true
    });
  }).catch(() => {
    console.log('failed to load viewbook');
  });
 }
}
async function cartPage(req, res) {
  const decode = tokenVerify(req);
  const total = await getTotalPrice(req);
  const cart = await cartBooks(req);
  res.render('userView/cart', {
    user: decode.value.name, cart, total, page: 'CART',
  });
}
function logout(req, res) {
  loginStat = false
  res.cookie('wisdom', '', { expiresIn: '0.1s' })
    .redirect('/');
}
function cartAdd(req, res) {
  const decode = tokenVerify(req);
  if(loginStat){
  addToCart(req.body.data, decode.value.id).then(() => {
    res.json({status:true})
  });
}else{
  res.redirect('/login')
}
}
function changeQuantity(req, res) {
  changeBookQuantity(req.body).then(() => {
    res.redirect('/cart');
  });
}
// function totalPrice(req, res) {
//   const decode = tokenVerify(req);
//   getTotalAmount(decode.value.id);
// }
async function checkoutForm(req, res) {
  const decode = tokenVerify(req);
  const total = await getTotalPrice(req);
  const cart = await cartBooks(req);
  res.render('userView/checkout', {
    user: decode.value.name, cart, total, page: 'CHECKOUT',
  });
}
async function currentAddress(req, res) {
  const decode = tokenVerify(req);
  const total = await getTotalPrice(req);
  const cart = await cartBooks(req);

  loadCurrentAddress(decode.value.id).then((address) => {
    // res.render('userView/checkout', {
    //   user: decode.value.name, cart, total, address, page: 'CHECKOUT',
    // });
    res.json(address)
  }).catch(() => {
    console.log('address getting error');
  });
}
async function checkoutFormSubmit(req, res) {
  const decode = tokenVerify(req);
  const cart = await getCartProducts(decode.value.id);
  let total;
  let product;
  if (cart) {
    total = await getTotalPrice(req);
    product = await getOrderProductToOrder(decode.value.id);
    if(req.body.offerPrice == ''){
      finalPrice = total
    }else{
      finalPrice = parseInt(req.body.offerPrice)
    }
    
  }
  if (!req.body.name || !req.body.street || !req.body.postcode) {
    res.render('userView/checkout', {
      user: decode.value.name, cart, total, page: 'CHECKOUT', errors: 'Fill Details',
    });
  } else if (!cart) {
    res.render('userView/checkout', {
      user: decode.value.name, cart, total, page: 'CHECKOUT', errors: 'No items in cart',
    });
  } else {
    const status = req.body.payment === 'COD' ? 'Order Placed' : 'pending';
    placeOrder(decode.value.id, product, req.body, status, finalPrice).then((orderId) => {
      removeCartAfterOrder(decode.value.id);
      if (req.body.payment === 'COD') {

          successAmount = finalPrice;
        mode = 'Order placed successfully';
        res.json({ cod: true });
      } else {
      // code for online payment
      let finalPrice;
      if(req.body.offerPrice == ''){
        finalPrice = total
      }else{
        finalPrice = req.body.offerPrice
      }
        successAmount = finalPrice;
        generateRazorpay(orderId, finalPrice).then((order) => [
          res.json({ cod: false, order }),
        ]);
      }
    }).catch(() => {

    });
  }
}
function verifyPayment(req, res) {
  paymentVerification(req.body).then(() => {
    console.log('successs');
    OrderStatusChange(req.body['order[receipt]']).then(() => {
      mode = 'Payment Successfully Completed';
      res.json({ status: true });
    });
  }).catch(() => {
    res.json({ status: false });
  });
}
function orderSuccess(req, res) {
  res.render('userView/order-success', { mode, successAmount });
}
async function getProfile(req, res) {
  const decode = tokenVerify(req);
  const total = await getTotalPrice(req);
  const cart = await cartBooks(req);
  getAccountInfo(decode.value.id).then(async (data) => {
    res.render('userView/account', {
      user: decode.value.name, cart, total, data, page: 'ACCOUNT',
    });
  }).catch(() => {
    console.log('failed to get account info');
  });
}
async function viewOrders(req, res) {
  const decode = tokenVerify(req);
  const cart = await cartBooks(req);
  const total = await getTotalPrice(req);

  console.log(total);
  userAllOrders(decode.value.id).then((products) => {
    res.render('userView/viewAllOrder', {
      products, user: decode.value.name, total, cart, page: 'ORDERS',
    });
  }).catch(() => {
    res.render('userView/view-orders', {
      user: decode.value.name, total, cart, page: 'ORDERS',
    });
  });
}
async function viewOrderProduct(req, res) {
  const decode = tokenVerify(req);
  const cart = await cartBooks(req);
  const total = await getTotalPrice(req);
  viewSingleUserOrder(req.params.id).then((order) => {
    res.render('userView/view-orders', {
      user: decode.value.name, total, cart, order, page: 'ORDERS',
    });
  });
}
function cancelOrder(req, res) {
  cancelOrderSubmit(req.body.data).then(() => {
    res.redirect('/view-orders');
  });
}
async function editAccount(req, res) {
  const decode = tokenVerify(req);
  let address;
  await loadCurrentAddress(decode.value.id).then((data) => {
    address = data;
  })
    .catch(() => {

    });
  res.render('userView/editAccount', { user: decode.value.name, address });
}
function editAccountSubmit(req, res) {
  const decode = tokenVerify(req);
  editAddress(decode.value.id, req.body).then(() => {
    res.redirect('/account');
  });
}
async function shopBooks(req, res) {
  if(loginStat){
    const decode = tokenVerify(req);
  const cart = await cartBooks(req);
  let category;
  await categoryUser().then((data) => {
    category = data;
  });
  const total = await getTotalPrice(req);
  if (filterStatus) {
    catg = books[0].category;
    res.render('userView/shopbook', {
      user: decode.value.name, books, catg, cart, total, category, page: 'SHOP',
    });
  } else {
    getAllBooks().then((book) => {
      catg = 'all';

      books = book.all;
      res.render('userView/shopbook', {
        user: decode.value.name, catg, books, cart, total, category, page: 'SHOP',
      });
    });
  }
  }else{
    let category;
    await categoryUser().then((data) => {
      category = data;
    });
    if (filterStatus) {
      catg = books[0].category;
      res.render('userView/shopbook', {
        user:'Login',guest:true, books, catg, category, page: 'SHOP',
      });
    } else {
      getAllBooks().then((book) => {
        catg = 'all';
  
        books = book.all;
        res.render('userView/shopbook', {
          user: 'Login',guest:true, catg, books, category, page: 'SHOP',
        });
      });
  }
}
}
async function filterBook(req, res) {
  // eslint-disable-next-line eqeqeq
  if (req.body.data == 'all') {
    filterStatus = false;
    await getAllBooks().then((book) => {
      catg = 'all';

      books = book.all;
      res.redirect('/shop-books');
    });
  } else {
    filterStatus = true;
    filterByCategory(req.body.data).then((book) => {
      books = book;
      res.redirect('/shop-books');
    });
  }
}
async function checkCoupon(req,res){
  const total = await getTotalPrice(req);
  couponManage(req.body.data,total).then((offerPrice)=>{
    res.json({offerPrice,status:true})
  }).catch((err)=>{
    res.json({status:false})
  })
}
function returnItem(req,res){
  const decode = tokenVerify(req);
  productReturn(req.body.order,req.body.pro,decode.value.id).then(()=>{
    res.json({status:true})
  }).catch(()=>{
    res.json({status:false})
  })
}
function getOffers(req,res){
  if(loginStat){

    const decode = tokenVerify(req);
    getAllCoupons().then((offers)=>{
      res.render('userView/offers',{user: decode.value.name,offers,page:'OFFERS'})
    }).catch(()=>{
      res.render('userView/offers',{user: decode.value.name,page: 'OFFERS'})
    })
  }else{
    getAllCoupons().then((offers)=>{
      res.render('userView/offers',{user: 'Login',guest:true,offers,page:'OFFERS'})
    }).catch(()=>{
      res.render('userView/offers',{user: 'Login',guest:true,page: 'OFFERS'})
    })
  }
}
function searchBooks(req,res){
  bookSearch(req.body.data).then((books)=>{
    res.json(books)
  }).catch(()=>{
    console.log("search book not found");
    res.json(false)
  })
}

module.exports = {
  searchBooks,
  getOffers,
  returnItem,
  checkCoupon,
  shopBooks,
  filterBook,
  editAccountSubmit,
  editAccount,
  viewOrderProduct,
  cancelOrder,
  viewOrders,
  currentAddress,
  getProfile,
  checkoutFormSubmit,
  checkoutForm,
  changeQuantity,
  cartPage,
  cartAdd,
  landingPage,
  loginPage,
  signUpPage,
  signUpSubmit,
  otpManager,
  loginSubmit,
  homePage,
  sendOtp,
  veryfyOtp,
  viewProduct,
  logout,
  orderSuccess,
  verifyPayment,
};
