const { getAllBooks, userLogin, userSignup, findByNumber, viewBook, addToCart, getCart, changeBookQuantity, getTotelAmount, loadCurrentAddress, getAccountInfo, getCartProducts, placeOrder, removeCartAfterOrder, OrderHistory, getOrderProductToOrder, cancelOrderSubmit, userAllOrders, viewSingleUserOrder, editAddress, categoryUser, filterByCategory } = require("../model/user-helpers");
const { tockenGenerator, tokenVerify } = require("../utils/token");
var jwt = require('jsonwebtoken');
const { cartBooks, getTotelPrice } = require("../utils/getcartbooks");
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
var number;
var filterStatus = false
var books;
var catg;
var jwtotpuser = { name: '', id: "" }


function landingPage(req, res) {
    getAllBooks().then((data) => {
        console.log(data);
        res.render('userView/landingPage', { data });
    })
        .catch(() => {
            console.log("failed to load books");
        })
}
function loginPage(req, res) {
    res.render('userView/login');
}
function signUpPage(req, res) {
    res.render('userView/register');
}
function signUpSubmit(req, res) {
    if (!req.body.username || !req.body.email || !req.body.password || !req.body.phone) {
        res.render('userView/register', { error: "Enter details" })
    } else if (!req.body.pass) {
        res.render('userView/register', { error: "please enter confirm password" })
    }
    else {
        let userData = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone
        }
        userSignup(userData)
            .then(async (response) => {
                var token = await tockenGenerator(response)
                res.cookie("wisdom", token, {
                    httpOnly: true
                }).redirect('/home')
            }).catch((err) => {
                res.render('userView/register', { error: err.error })
            })
    }
}
function otpManager(req, res) {
    res.render('userView/otpPage')
}
function loginSubmit(req, res) {
    userLogin(req.body)
        .then(async (response) => {
            var token = await tockenGenerator(response)
            res.cookie("wisdom", token, {
                httpOnly: true
            }).redirect('/home')
        })
        .catch((err) => {
            res.render('userView/login', { error: err.error })
        })
}
function homePage(req, res) {
    var decode = tokenVerify(req)
    getAllBooks().then(async (data) => {
        let cart = await cartBooks(req)
        let totel = await getTotelPrice(req)
        console.log(data);
        res.render('userView/userHome', { data, user: decode.value.name, cart, totel });
    }).catch(() => {
        console.log("failed to load books");
    })
}
function sendOtp(req, res) {
    console.log(req.body.number);
    number = req.body.number
    if (number.substring(0, 3) != '+91') {
        number = '+91' + number
    }
    //accound finding
    findByNumber(number).then((user) => {
        console.log(user);
        jwtotpuser.name = user.username
        jwtotpuser.id = user._id
        client.verify
            .services(process.env.SERVICE_ID)
            .verifications.create({
                to: number,
                channel: "sms"
            })
            .then((resp) => {
                res.render('userView/verifyPage')
            })
            .catch((err) => {
                console.log(err);
            })
    })
        .catch((err) => {
            res.render('userView/otpPage', { error: err })
        })

}
function veryfyOtp(req, res) {
    console.log(req.body.otp);
    client.verify
        .services(process.env.SERVICE_ID)
        .verificationChecks.create({
            to: `+${number}`,
            code: req.body.otp
        }).then(async (data) => {
            if (data.status == "approved") {
                const token = await tockenGenerator(jwtotpuser)
                res.cookie("wisdom", token, {
                    httpOnly: true
                }).redirect('/home')
            } else {
                console.log("OTP not matched");
                res.render('userView/verifyPage', { error: 'invalied OTP' })
            }
        })
    // const token = tockenGenerator(jwtotpuser)
    //             res.cookie("wisdom", token, {
    //                httpOnly: true
    //            }).redirect('/home')
}
function viewProduct(req, res) {
    var decode = tokenVerify(req)
    viewBook(req.params.id).then(async (book) => {
        let cart = await cartBooks(req)
        let totel = await getTotelPrice(req)
        res.render('userView/view-product', { user: decode.value.name, book, cart, totel })
    }).catch(() => {
        console.log('failed to load viewbook');
    })
}
async function cartPage(req, res) {
    var decode = tokenVerify(req)
    let totel = await getTotelPrice(req)
    let cart = await cartBooks(req)
    res.render('userView/cart', { user: decode.value.name, cart, totel, page: 'CART' })


}
function logout(req, res) {
    res.cookie('wisdom', '', { expiresIn: '0.1s' })
        .redirect('/')
}
function cartAdd(req, res) {
    console.log(req.params.id);
    var decode = tokenVerify(req)
    addToCart(req.params.id, decode.value.id).then(() => {
        res.redirect(req.get('referer'));
    })
}
function changeQuantity(req, res) {
    changeBookQuantity(req.body).then(() => {
        res.redirect('/cart')
    })
}
function totelPrice(req, res) {
    var decode = tokenVerify(req)
    getTotelAmount(decode.value.id)
}
async function checkoutForm(req, res) {
    var decode = tokenVerify(req)
    let totel = await getTotelPrice(req)
    let cart = await cartBooks(req)
    res.render('userView/checkout', { user: decode.value.name, cart, totel, page: 'CHECKOUT' })
}
async function currentAddress(req, res) {
    var decode = tokenVerify(req)
    let totel = await getTotelPrice(req)
    let cart = await cartBooks(req)

    loadCurrentAddress(decode.value.id).then((address) => {
        res.render('userView/checkout', { user: decode.value.name, cart, totel, address, page: 'CHECKOUT' })
    }).catch(() => {
        console.log("address getting error");
    })
}
async function checkoutFormSubmit(req, res) {
    let decode = tokenVerify(req)

    let cart = await getCartProducts(decode.value.id)
    if (cart) {
        var totel = await getTotelPrice(req)
        var product = await getOrderProductToOrder(decode.value.id)
    }
    if (!req.body.name || !req.body.street || !req.body.postcode) {
        res.render('userView/checkout', { user: decode.value.name, cart, totel, page: 'CHECKOUT', error: 'Fill Details' })
    } else if (!cart) {
        res.render('userView/checkout', { user: decode.value.name, cart, totel, page: 'CHECKOUT', error: 'No items in cart' })
    }
    else {
        let status = req.body.payment == 'COD' ? 'placed' : 'pending'
        if (req.body.payment == 'COD') {
            placeOrder(decode.value.id, product, req.body, status, totel).then(() => {
                removeCartAfterOrder(decode.value.id)
                res.render("userView/order-success", { mode: 'Order Placed Successfully', totel })
            }).catch(() => {

            })

        } else {
            // code for online payment
        }
    }
}
async function getProfile(req, res) {
    var decode = tokenVerify(req)
    let totel = await getTotelPrice(req)
    let cart = await cartBooks(req)
    getAccountInfo(decode.value.id).then(async (data) => {
        res.render('userView/account', { user: decode.value.name, cart, totel, data, page: 'ACCOUNT' })
    }).catch(() => {
        console.log("failed to get account info");
    })
}
async function viewOrders(req, res) {
    var decode = tokenVerify(req)
    let cart = await cartBooks(req)
    let totel = await getTotelPrice(req)

    console.log(totel);
    userAllOrders(decode.value.id).then((products) => {
        console.log(products);
        res.render('userView/viewAllOrder', { products, user: decode.value.name, totel, cart, page: 'ORDERS' })
    }).catch(() => {
        res.render('userView/view-orders', { user: decode.value.name, totel, cart, page: 'ORDERS' })

    })
}
async function viewOrderProduct(req, res) {
    var decode = tokenVerify(req)
    let cart = await cartBooks(req)
    let totel = await getTotelPrice(req)
    viewSingleUserOrder(req.params.id).then((order) => {
        res.render('userView/view-orders', { user: decode.value.name, totel, cart, order, page: 'ORDERS' })
    })
}
function cancelOrder(req, res) {
    cancelOrderSubmit(req.body.data).then(() => {
        res.redirect('/view-orders')
    })
}
async function editAccount(req, res) {
    var decode = tokenVerify(req)
    let address;
    await loadCurrentAddress(decode.value.id).then((data) => {
        address = data
    })
    res.render('userView/editAccount', { user: decode.value.name, address })
}
function editAccountSubmit(req, res) {
    var decode = tokenVerify(req)
    editAddress(decode.value.id, req.body).then(() => {
        res.redirect('/account')
    })

}
async function shopBooks(req, res) {
    var decode = tokenVerify(req)
    let cart = await cartBooks(req)
    let category;
    await categoryUser().then((data) => {
        category = data
    })
    let totel = await getTotelPrice(req)
    if (filterStatus) {
        catg = books[0].category
        res.render('userView/shopbook', { user: decode.value.name, books, catg, cart, totel, category, page: 'SHOP' })

    } else {
        getAllBooks().then((book) => {
            catg = 'all'

            books = book.all
            res.render('userView/shopbook', { user: decode.value.name, catg, books, cart, totel, category, page: 'SHOP' })
        })
    }

}
async function filterBook(req, res) {
    let category;
    await categoryUser().then((data) => {
        category = data
    })
    if (req.body.data == 'all') {
        filterStatus = false
        await getAllBooks().then((book) => {
            catg = 'all'

            books = book.all
            console.log(books);
            res.redirect('/shop-books')
        })
    } else {
        filterStatus = true
        filterByCategory(req.body.data).then((book) => {
            console.log("boooooooks", books, "///////////////");
            books = book
            res.redirect('/shop-books')

        })
    }
}

module.exports = { shopBooks, filterBook, editAccountSubmit, editAccount, viewOrderProduct, cancelOrder, viewOrders, currentAddress, getProfile, checkoutFormSubmit, checkoutForm, totelPrice, changeQuantity, cartPage, cartAdd, landingPage, loginPage, signUpPage, signUpSubmit, otpManager, loginSubmit, homePage, sendOtp, veryfyOtp, viewProduct, logout }