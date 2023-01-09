const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const collections = require('./dbConnection/collection');
const db = require('./dbConnection/connection');
const { deliveryStatus } = require('../controller/admin-controller');
const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});
function userSignup(userDatas) {
  const userData = userDatas;
  userData.createdAt = new Date().toDateString();
  userData.isBlocked = false;
  userData.phone = `+91${userData.phone}`;
  return new Promise(async (resolve, reject) => {
    const user = await db.get().collection(collections.USER_COLLECTION).findOne({
      $or: [
        {
          email: userData.email,
        },
        {
          phone: userData.phone,
        },
      ],
    });
    if (user) {
      reject({ error: 'user already exist' });
    } else {
      userData.password = await bcrypt.hash(userData.password, 10);
      const res = await db.get().collection(collections.USER_COLLECTION).insertOne(userData);
      if (res.insertedId) {
        const data = {
          name: userData.username,
          id: res.insertedId,
        };
        resolve(data);
      } else {
        reject();
      }
    }
  });
}
function userLogin(userData) {
  return new Promise(async (resolve, reject) => {
    const res = await db.get().collection(collections.USER_COLLECTION)
      .findOne({ email: userData.email });
    if (res) {
      if (res.isBlocked) {
        reject({ error: 'This user have been blocked' });
      } else {
        bcrypt.compare(userData.password, res.password).then((result) => {
          if (result) {
            const data = {
              name: res.username,
              id: res._id,
            };
            resolve(data);
          } else {
            reject({ error: 'Wrong password' });
          }
        });
      }
    } else {
      reject({ error: 'Invalied User' });
    }
  });
}
function userBlockCheck(userId) {
  return new Promise(async (resolve, reject) => {
    const user = await db.get().collection(collections.USER_COLLECTION)
      .findOne({ _id: ObjectId(userId) });
    if (user.isBlocked) {
      reject();
    } else {
      resolve();
    }
  });
}
function getAllBooks() {
  return new Promise(async (resolve, reject) => {
    try {
      const all = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray();
      const history = await db.get().collection(collections.PRODUCT_COLLECTION).find({ category: 'history' }).toArray();
      const romance = await db.get().collection(collections.PRODUCT_COLLECTION).find({ category: 'romance' }).toArray();
      const fantasy = await db.get().collection(collections.PRODUCT_COLLECTION).find({ category: 'fantasy' }).toArray();
      const kids = await db.get().collection(collections.PRODUCT_COLLECTION).find({ category: 'kids' }).toArray();
      const banner = await db.get().collection(collections.BANNER_COLLECTION).find().toArray();
      if (all.length !== 0) {
        const data = {
          all,
          history,
          romance,
          fantasy,
          kids,
          banner: banner[0],
        };
        resolve(data);
      } else {
        reject();
      }
    } catch (err) {
      console.log(err);
    }
  });
}
function findByNumber(num) {
  return new Promise(async (resolve, reject) => {
    const user = await db.get().collection(collections.USER_COLLECTION).findOne({ phone: num });
    if (user) {
      if (user.isBlocked) {
        reject({ err: 'This account is block' });
      } else {
        resolve(user);
      }
    } else {
      reject({ err: 'account not found' });
    }
  });
}
function viewBook(bookId) {
  return new Promise((resolve, reject) => {
    const book = db.get().collection(collections.PRODUCT_COLLECTION)
      .findOne({ _id: ObjectId(bookId) });
    if (book) {
      resolve(book);
    } else {
      reject();
    }
  });
}
function addToCart(proId, userId) {
  const proObj = {
    item: ObjectId(proId),
    quantity: 1,
  };
  return new Promise(async (resolve, reject) => {
    const userCart = await db.get().collection(collections.CART_COLLECTION)
      .findOne({ user: ObjectId(userId) });
    if (userCart) {
      const proExist = userCart.books.findIndex((book) => book.item == proId);
      if (proExist !== -1) {
        db.get().collection(collections.CART_COLLECTION).updateOne({ user: ObjectId(userId), 'books.item': ObjectId(proId) }, {
          $inc: { 'books.$.quantity': 1 },
        }).then(() => {
          resolve();
        });
      } else {
        db.get().collection(collections.CART_COLLECTION).updateOne({ user: ObjectId(userId) }, {
          $push: {
            books: proObj,
          },
        }).then(() => {
          resolve();
        });
      }
    } else {
      const cart = {
        user: ObjectId(userId),
        books: [proObj],
      };
      db.get().collection(collections.CART_COLLECTION).insertOne(cart).then(() => {
        resolve();
      });
    }
  });
}
function getCart(userId) {
  return new Promise(async (resolve, reject) => {
    const cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
      {
        $match: {
          user: ObjectId(userId),
        },
      },
      {
        $unwind: '$books',
      },
      {
        $project: {
          item: '$books.item',
          quantity: '$books.quantity',
        },
      },
      {
        $lookup: {
          from: 'books',
          localField: 'item',
          foreignField: '_id',
          as: 'cartItem',
        },
      },
      {
        $project: {
          item: 1, quantity: 1, book: { $arrayElemAt: ['$cartItem', 0] },
        },
      },
    ]).toArray();
    if (cartItems) {
      resolve(cartItems);
    } else {
      reject();
    }
  });
}
function changeBookQuantity(details) {
  // eslint-disable-next-line radix
  const count = parseInt(details.count);
  return new Promise(async (resolve, reject) => {
    if (count == -1 && details.quantity == 1) {
      db.get().collection(collections.CART_COLLECTION).updateOne({ $and: [{ _id: ObjectId(details.cart) }, { 'books.item': ObjectId(details.product) }] }, {
        $pull: {
          books: { item: ObjectId(details.product) },
        },
      }).then(() => {
        resolve();
      });
    } else {
      db.get().collection(collections.CART_COLLECTION).updateOne({ $and: [{ _id: ObjectId(details.cart) }, { 'books.item': ObjectId(details.product) }] }, {
        $inc: {
          'books.$.quantity': count,
        },
      }).then(() => {
        resolve();
      });
    }
  });
}
function getTotalAmount(userId) {
  return new Promise(async (resolve, reject) => {
    const total = await db.get().collection(collections.CART_COLLECTION).aggregate([
      {
        $match: {
          user: ObjectId(userId),
        },
      },
      {
        $unwind: '$books',
      },
      {
        $project: {
          item: '$books.item',
          quantity: '$books.quantity',
        },
      },
      {
        $lookup: {
          from: 'books',
          localField: 'item',
          foreignField: '_id',
          as: 'cartItem',
        },
      },
      {
        $project: {
          item: 1, quantity: 1, book: { $arrayElemAt: ['$cartItem', 0] },
        },
      },
      {
        "$set":{
          "final":{
            "$switch":{
              "branches":
              [{"case":{"$and":["$book.offer",{"$ne":["$book.price",""]}]},
              "then":"$book.offer"},
              {"case":{"$and":["$book.price",{"$ne":["$book.offer",""]}]},
              "then":"$book.price"}
            ],
            "default":""
            }
          }
        }
      },
 
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$quantity', '$final'] } },
        },
      },
    ]).toArray();
    if (total.length != 0) {
      resolve(total[0]?.total);
    } else {
      reject();
    }
  });
}
function loadCurrentAddress(userId) {
  return new Promise(async (resolve, reject) => {
    const user = await db.get().collection(collections.USER_COLLECTION)
      .findOne({ _id: ObjectId(userId) });
    if (user?.address) {
      resolve(user.address);
    } else {
      reject();
    }
  });
}
function getAccountInfo(userId) {
  return new Promise(async (resolve, reject) => {
    const info = await db.get().collection(collections.USER_COLLECTION)
      .findOne({ _id: ObjectId(userId) });
    resolve(info);
  });
}
function getCartProducts(userId) {
  return new Promise((resolve, reject) => {
    const cart = db.get().collection(collections.CART_COLLECTION)
      .findOne({ user: ObjectId(userId) });
    resolve(cart);
  });
}
function placeOrder(userId, product, order, status, total) {
  
  const orderObj = {
    user: ObjectId(userId),
    deliveryDetails: {
      name: order.name,
      street: order.street,
      street2: order.street2,
      town: order.town,
      postcode: order.postcode,
      phone: order.phone,
      email: order.email,
    },
    product,
    totalPrice: total,
    paymentMethod: order.payment,
    date: new Date().toDateString(),
    fullDate: new Date(),
    status,
    btnStatus: true,
  };
  return new Promise((resolve, reject) => {
    db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj)
    .then((res) => {
      db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:ObjectId(res.insertedId)},{
        $set:{'product.$[].cartItem.deliveryStatus':'Order confirmed'}
      },{multi:true})
      resolve(res.insertedId);
    })
      .catch(() => {
        reject();
      });
  });
}
function removeCartAfterOrder(userId) {
  return new Promise((resolve, reject) => {
    db.get().collection(collections.CART_COLLECTION)
      .deleteOne({ user: ObjectId(userId) }).then(() => {
        resolve();
      })
      .catch(() => {
        reject();
      });
  });
}
function getOrderProductToOrder(userId) {
  return new Promise(async (resolve, reject) => {
    const product = await db.get().collection(collections.CART_COLLECTION).aggregate([
      {
        $match: {
          user: ObjectId(userId),
        },
      },
      {
        $unwind: '$books',
      },
      {
        $project: {
          item: '$books.item',
          quantity: '$books.quantity',
        },
      },
      {
        $lookup: {
          from: 'books',
          localField: 'item',
          foreignField: '_id',
          as: 'cartItem',
        },
      },
      {
        $project: {
          cartItem: 1,
          quantity: 1,
        },
      },
      {
        $unwind: '$cartItem',
      },
      {
        $project: {
          _id: 0,
          'cartItem._id': 1,
          'cartItem.price': 1,
          quantity: 1,
        },
      },
    ]).toArray();
    if (product.length == 0) {
      reject();
    } else {
      resolve(product);
    }
  });
}
function OrderHistory(userId) {
  return new Promise(async (resolve, reject) => {
    const history = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $match: { user: ObjectId(userId) },
      },
      {
        $unwind: '$product',
      },
      {
        $lookup: {
          from: 'books',
          localField: 'product.cartItem._id',
          foreignField: '_id',
          as: 'orders',
        },
      },
      {
        $unwind: '$orders',
      },
      {
        $project: {
          deliveryDetails: 1, paymentMethod: 1, date: 1, status: 1, 'orders.bookname': 1, 'orders.authorname': 1, 'product.cartItem': 1, 'product.quantity': 1, 'orders._id': 1,
        },
      },
    ]).toArray();
    if (history.length !== 0) resolve(history);
    else reject();
  });
}
function userAllOrders(userId) {
  return new Promise(async (resolve, reject) => {
    const orders = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $match: { user: ObjectId(userId) },
      }

    ]).toArray();
    if (orders.length == 0) {
      reject();
    } else {
      resolve(orders);
    }
  });
}
function viewSingleUserOrder(orderId) {
  return new Promise(async (resolve, reject) => {
    const singleOrder = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $match: { _id: ObjectId(orderId) },
      },
      {
        $project: {
          product: 1,
          deliveryDetails: 1,
          returnOption:1
        },
      },
      {
        $unwind: '$product',
      },
      {
        $lookup: {
          from: 'books',
          localField: 'product.cartItem._id',
          foreignField: '_id',
          as: 'orders',
        },
      },
      {
        $unwind: '$orders',
      },
    ]).toArray();
    if (singleOrder.length !== 0) resolve(singleOrder);
    else reject();
  });
}

function cancelOrderSubmit(orderId) {
  return new Promise(async (resolve, reject) => {
    await db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
      $set: {
        status: 'Cancelled',
        deliveryStatus: 'Cancelled',
        btnStatus: false,
      },
    }).then(() => {
      resolve();
    })
      .catch(() => {
        reject();
      });
  });
}
function editAddress(userId, data) {
  return new Promise((resolve, reject) => {
    db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
      $set: {
        username: data.name,
        'address.name': data.name,
        'address.street': data.street,
        'address.street2': data.street2,
        'address.city': data.city,
        'address.district': data.district,
        'address.state': data.state,
        'address.postcode': data.postcode,
      },
    }).then(() => {
      resolve();
    })
      .catch(() => reject());
  });
}
function categoryUser() {
  return new Promise(async (resolve, reject) => {
    const category = await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray();
    if (category.length != 0) {
      resolve(category);
    } else {
      reject();
    }
  });
}
function filterByCategory(data) {
  return new Promise(async (resolve, reject) => {
    const books = await db.get().collection(collections.PRODUCT_COLLECTION)
      .find({ category: data }).toArray();
    if (books) { resolve(books); } else reject();
  });
}
function generateRazorpay(orderId, amount) {
  return new Promise((resolve, reject) => {
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `${orderId}`,
      notes: {
        key1: 'value3',
        key2: 'value2',
      },
    };
    instance.orders.create(options, (err, order) => {
      if (err) {
        console.log(err);
      } else {
        console.log(order);
        resolve(order);
      }
    });
  });
}
function paymentVerification(details) {
  return new Promise((resolve, reject) => {
    let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
    hmac.update(`${details['payment[razorpay_order_id]']}|${details['payment[razorpay_payment_id]']}`);
    hmac = hmac.digest('hex');
    if (hmac == details['payment[razorpay_signature]']) {
      resolve();
    } else {
      reject();
    }
  });
}
function OrderStatusChange(orderId) {
  return new Promise((resolve, reject) => {
    db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
      $set: { status: 'Order placed' },
    });
    resolve();
  });
}
function couponManage(C_code,total){
  C_code = C_code.toUpperCase()
  return new Promise(async(resolve,reject)=>{
    const coupon = await db.get().collection(collections.COUPON_COLLECTION).aggregate([
      {
        $match:{$and:[{code:C_code},
          {limit:{$gte:total}},
          {isoDateStart:{$lte: new Date()}},
          {isoDateEnd:{$gte: new Date()}}
        ]}
      },
      {
        $project:{
          _id:null,
          offerAmount:{$subtract:[total,{$divide:[{$multiply:[total,'$percentage']},100]}]}
        }
      }
      
    ]).toArray()
    if(coupon.length !=0){
      resolve(coupon[0]?.offerAmount)
    }else{
      reject()
    }
    
  })
}

function productReturn(orderId,proId,userId){
  return new Promise((resolve,reject)=>{
    db.get().collection(collections.ORDER_COLLECTION)
    .updateOne({$and:[{_id:ObjectId(orderId)},{user:ObjectId(userId)},{product:{$elemMatch:{'cartItem._id':ObjectId(proId)}} }]},{
     $set:{
      'product.$.cartItem.deliveryStatus':'Return',
      'product.$.cartItem.returnOption':false,
     }
    })
    resolve()
  })
}
function getAllCoupons(){
  return new Promise(async(resolve,reject)=>{
    const normalCoupons = await db.get().collection(collections.COUPON_COLLECTION).find({type:'normal'}).toArray()
    const categoryCoupons = await db.get().collection(collections.COUPON_COLLECTION).find({type:'category'}).toArray()
    const productCoupons = await db.get().collection(collections.COUPON_COLLECTION).aggregate([
      {
        $match:{type:'product'}
      },
      {
        $lookup:{
          from:'books',
          localField:'id',
          foreignField:'_id',
          as:'product'
        }
      },
      {
        $unwind:'$product'
      }
    ]).toArray()
    if(normalCoupons.length !=0 || categoryCoupons.length != 0){
      resolve({normalCoupons,categoryCoupons,productCoupons:productCoupons})
    }else{
      reject()
    }
  })
}
function bookSearch(data){
  return new Promise(async(resolve,reject)=>{
    const book = await db.get().collection(collections.PRODUCT_COLLECTION).find({$text: { $search: data } }).toArray()
    if(book.length != 0){
      resolve(book)
    }else{
      reject()
    }
  })
}

module.exports = {
  bookSearch,
  getAllCoupons,
  productReturn,
  couponManage,
  filterByCategory,
  editAddress,
  categoryUser,
  viewSingleUserOrder,
  userAllOrders,
  cancelOrderSubmit, 
  OrderHistory,
  getOrderProductToOrder,
  removeCartAfterOrder,
  loadCurrentAddress,
  placeOrder,
  getCartProducts,
  getAccountInfo,
  getTotalAmount,
  changeBookQuantity,
  getCart,
  userSignup,
  userLogin,
  userBlockCheck,
  getAllBooks,
  findByNumber,
  viewBook,
  addToCart,
  generateRazorpay,
  paymentVerification,
  OrderStatusChange,
};
