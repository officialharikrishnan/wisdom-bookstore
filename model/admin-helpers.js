const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const collections = require('./dbConnection/collection');
const db = require('./dbConnection/connection');

function adminDoLogin(datas) {
  return new Promise(async (resolve, reject) => {
    const res = await db.get().collection(collections.ADMIN_COLLECTION)
      .findOne({ email: datas.email });
    if (res) {
      bcrypt.compare(datas.password, res.password).then((result) => {
        if (result) {
          const data = {
            name: res.adminId,
          };
          resolve(data);
        }
      }).catch(() => {
        reject({ error: 'Invalid password' });
      });
    } else {
      reject({ error: 'Invalied email' });
    }
  });
}
function getAllUsers() {
  return new Promise(async (resolve, reject) => {
    const users = await db.get().collection(collections.USER_COLLECTION).find().toArray();
    if (users.length !== 0) {
      console.log(users);
      resolve(users);
    } else {
      reject();
    }
  });
}
function userBlockManage(userId, status) {
  let update;
  if (status === 'true') {
    update = false;
  } else {
    update = true;
  }
  return new Promise(async (resolve, reject) => {
    await db.get().collection(collections.USER_COLLECTION)
      .updateOne({ _id: ObjectId(userId) }, {
        $set: {
          isBlocked: update,
        },
      }).then(() => {
        resolve();
      });
  }).catch((err) => {
    console.log(err);
  });
}
function addStock(product) {
  // eslint-disable-next-line
  product.price = parseInt(product.price);
  product.qty = parseInt(product.qty);
  // eslint-disable-next-line
  product.availability = true;
  return new Promise(async (resolve, reject) => {
    const book = await db.get().collection(collections.PRODUCT_COLLECTION).insertOne(product);
    console.log('book', book);
    const data = {
      id: book.insertedId,
    };
    if (book) {
      resolve(data);
    } else {
      reject();
    }
  }).catch((err) => {
    console.log(err);
  });
}
function getAllStocks() {
  return new Promise(async (resolve, reject) => {
    const books = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray();
    resolve(books);
  });
}
function getBook(bookId) {
  return new Promise(async (resolve, reject) => {
    const book = await db.get().collection(collections.PRODUCT_COLLECTION)
      .findOne({ _id: ObjectId(bookId) });
    if (book) {
      resolve(book);
    } else {
      reject();
    }
  });
}
function doEditBook(bookdata, bookId) {
  return new Promise((resolve, reject) => {
    db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(bookId) }, {
      $set: {
        bookname: bookdata.bookname,
        authorname: bookdata.authorname,
        aboutbook: bookdata.aboutbook,
        aboutauthor: bookdata.aboutauthor,
        category: bookdata.category,
        language: bookdata.language,
        dateofpublish: bookdata.dateofpublish,
        // eslint-disable-next-line radix
        price: parseInt(bookdata.price),
        qty: parseInt(bookdata.qty),
      },
    });
    resolve(bookdata.category);
  }).catch((err) => {
    console.log(err);
  });
}
function removeBook(bookStatus, bookId) {
  let status;
  console.log(bookStatus, bookId);
  if (bookStatus == 'true') {
    status = false;
  } else {
    status = true;
  }
  return new Promise((resolve, reject) => {
    db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(bookId) }, {
      $set: {
        availability: status,
      },
    }).then(() => {
      resolve();
    });
  });
}
function addBanner(imageName) {
  return new Promise((resolve, reject) => {
    db.get().collection(collections.BANNER_COLLECTION).insertOne(imageName).then(() => {
      resolve();
    });
  });
}
function getBanner() {
  return new Promise(async (resolve, reject) => {
    const response = await db.get().collection(collections.BANNER_COLLECTION)
      .find().toArray();
    resolve(response[0]);
  });
}
function category() {
  return new Promise(async (resolve, reject) => {
    const categories = await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray();
    if (categories.length != 0) {
      resolve(categories);
    } else {
      reject();
    }
  });
}
function addCategory(datas) {
  const data = datas.toLowerCase();
  return new Promise(async (resolve, reject) => {
    const exist = await db.get().collection(collections.CATEGORY_COLLECTION)
      .findOne({ name: data });
    if (exist) {
      reject({ err: 'edit category error find' });
    } else {
      db.get().collection(collections.CATEGORY_COLLECTION).insertOne({ name: data });
      resolve();
    }
  }).catch((err) => {
    console.log(err);
    reject();
  });
}
function removeCategory(id) {
  return new Promise(async (resolve, reject) => {
    const deleted = await db.get().collection(collections.CATEGORY_COLLECTION)
      .findOneAndDelete({ _id: ObjectId(id) });
    resolve(deleted);
  });
}
function editCategorySub(id, data) {
  return new Promise(async (resolve, reject) => {
    const oldCategory = await db.get().collection(collections.CATEGORY_COLLECTION)
      .findOneAndUpdate({ _id: ObjectId(id) }, {
        $set: {
          name: data,
        },
      });
    resolve(oldCategory.value.name);
  });
}
function deleteByCategory(data) {
  return new Promise((resolve, reject) => {
    db.get().collection(collections.PRODUCT_COLLECTION)
      .updateMany({ category: data.value.name }, {
        $set: {
          availability: false,
        },
      });
    resolve();
  });
}
function updateBookCategory(old, newcategory) {
  return new Promise((resolve, reject) => {
    db.get().collection(collections.PRODUCT_COLLECTION).updateMany({ category: old }, {
      $set: {
        category: newcategory,
      },
    });
    resolve();
  });
}
function AllOrders() {
  return new Promise(async (resolve, reject) => {
    const orders = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          'user.username': 1, deliveryDetails: 1, btnStatus: 1, product: 1, totalPrice: 1, paymentMethod: 1, date: 1, status: 1, deliveryStatus: 1,
        },
      },
    ]).toArray();
    if (orders.length == 0) {
      reject();
    } else {
      resolve(orders);
    }
  });
}
function viewSingleOrder(orderId) {
  return new Promise(async (resolve, reject) => {
    const singleOrder = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $match: { _id: ObjectId(orderId) },
      },
      {
        $project: {
          _id: 1,
          product: 1,
          deliveryDetails: 1,
          deliveryStatus: 1,
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
    console.log(singleOrder, '>>>>>>single<<<<<<<<<<');
    resolve(singleOrder);
  });
}

function cancelOrderAdminSubmit(orderId) {
  return new Promise(async (resolve, reject) => {
    await db.get().collection(collections.ORDER_COLLECTION)
      .updateOne({ _id: ObjectId(orderId) }, {
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
function deliveryStatusChange(orderId, proId, status) {
  console.log(orderId, proId, status);
  let returnOption;
  if (status == 'Delivered') {
    returnOption = true;
    cancelOption = false;
  } else {
    returnOption = false;
    cancelOption = true;
  }
  return new Promise(async (resolve, reject) => {
    await db.get().collection(collections.ORDER_COLLECTION)
      .updateOne({ _id: ObjectId(orderId), product: { $elemMatch: { 'cartItem._id': ObjectId(proId) } } }, {
        $set: {
          'product.$.cartItem.deliveryStatus': status,
          'product.$.cartItem.returnOption': returnOption,
          btnStatus: cancelOption,
        },
      }).then(() => {
        resolve();
      })
      .catch(() => {
        reject();
      });
  });
}
function totalusers() {
  return new Promise(async (resolve, reject) => {
    const users = await db.get().collection(collections.USER_COLLECTION).find().toArray();
    resolve(users);
  });
}
function getDailyOrder() {
  const currentDate = new Date();
  return new Promise(async (resolve, reject) => {
    const order = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $match: { date: new Date().toDateString() },
      },
    ]).toArray();
    resolve(order);
  });
}
function weeklyOrders() {
  return new Promise(async (resolve, reject) => {
    const orders = await db.get().collection(collections.ORDER_COLLECTION)
      .find({
        $and: [
          { fullDate: { $lte: new Date() } },
          { fullDate: { $gte: new Date(new Date().getDate() - 7) } },
        ],
      }).toArray();
    resolve(orders);
  });
}
function yearlyOrders() {
  return new Promise(async (resolve, reject) => {
    const orders = await db.get().collection(collections.ORDER_COLLECTION)
      .find({
        fullDate: { $gte: new Date(new Date().getFullYear - 1) },
      }).toArray();
    resolve(orders);
  });
}
function getDailyRevenue() {
  const currentDate = new Date().toDateString();
  return new Promise(async (resolve, reject) => {
    const sales = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $match: { date: currentDate },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]).toArray();
    if (sales.length === 0) {
      reject();
    } else {
      resolve(sales[0].total);
    }
  });
}
function getWeeklyRevenue() {
  return new Promise(async (resolve, reject) => {
    const sales = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $match: { fullDate: { $gte: new Date(new Date().getDate() - 7) } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]).toArray();
    if (sales.length !== 0) {
      resolve(sales[0].total);
    } else {
      reject();
    }
  });
}
function getYearlyRevenue() {
  return new Promise(async (resolve, reject) => {
    const sales = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $match: { fullDate: { $gte: new Date(new Date().getFullYear - 1) } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]).toArray();
    if (sales.length !== 0) {
      resolve(sales[0].total);
    } else {
      reject();
    }
  });
}
function revenueGraph() {
  return new Promise(async (resolve, reject) => {
    const cod = await db.get().collection(collections.ORDER_COLLECTION).find({ paymentMethod: 'COD' }).toArray();
    const online = await db.get().collection(collections.ORDER_COLLECTION).find({ paymentMethod: 'Online' }).toArray();

    resolve({ cod: cod.length, online: online.length });
  });
}
async function createCoupon(coupon) {
  let applyCoupon = false;
  if (coupon.type == 'product') {
    coupon.percentage = parseInt(coupon.percentage);
    coupon.isoDateEnd = new Date(coupon.endDate);
    coupon.id = ObjectId(coupon.id);

    const offerField = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ $and: [{ _id: coupon.id }, { offer: { $exists: true } }] });
    if (offerField) {
      const data = await db.get().collection(collections.COUPON_COLLECTION).findOne({ $and: [{ type: 'category' }, { category: offerField.category }] });
      console.log(data);
      if (data) {
        if (coupon.percentage > data.percentage) {
          applyCoupon = true;
        }
      }
    } else {
      applyCoupon = true;
    }
  } else {
    coupon.limit = parseInt(coupon.limit);
    coupon.code = coupon.code.toUpperCase();
    coupon.percentage = parseInt(coupon.percentage);
    coupon.isoDateStart = new Date(coupon.startDate);
    coupon.isoDateEnd = new Date(coupon.endDate);
  }
  if (coupon.type == 'category') {
    coupon.categoryOption = true;
  }
  return new Promise(async (resolve, reject) => {
    db.get().collection(collections.COUPON_COLLECTION).insertOne(coupon);
    if (coupon.type == 'category') {
      var samp = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
        {
          $match: { category: coupon.category },
        },
        {
          $project: { price: 1 },
        },

        {
          $addFields: {
            offer: { $subtract: ['$price', { $divide: [{ $multiply: ['$price', coupon.percentage] }, 100] }] },

          },
        },
      ]).forEach((element) => {
        db.get().collection(collections.PRODUCT_COLLECTION).updateMany({ _id: element._id }, {
          $set: {
            offer: element.offer,
          },
        });
      });
    } else if (coupon.type == 'product' && applyCoupon) {
      var samp = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
        {
          $match: { _id: coupon.id },
        },
        {
          $project: { price: 1 },
        },

        {
          $addFields: {
            offer: { $subtract: ['$price', { $divide: [{ $multiply: ['$price', coupon.percentage] }, 100] }] },

          },
        },
      ]).toArray();
      console.log(samp, '>>>>>>>>>>>>>>>>>>>>>>');
      db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: coupon.id }, {
        $set: {
          offer: samp[0].offer,
        },
      });
    }

    resolve();
  });
}
function getAllCoupons() {
  return new Promise(async (resolve, reject) => {
    const normalCoupons = await db.get().collection(collections.COUPON_COLLECTION).find({ type: 'normal' }).toArray();
    const categoryCoupons = await db.get().collection(collections.COUPON_COLLECTION).find({ type: 'category' }).toArray();
    const productCoupons = await db.get().collection(collections.COUPON_COLLECTION).aggregate([
      {
        $match: { type: 'product' },
      },
      {
        $lookup: {
          from: 'books',
          localField: 'id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
    ]).toArray();
    if (normalCoupons.length != 0 || categoryCoupons.length != 0) {
      resolve({ normalCoupons, categoryCoupons, productCoupons });
    } else {
      reject();
    }
  });
}
function romoveCoupon(id) {
  console.log('called>>>>>>>>', id);
  return new Promise(async (resolve, reject) => {
    const coupon = await db.get().collection(collections.COUPON_COLLECTION).findOneAndDelete({ _id: ObjectId(id) });
    if (coupon.value.type == 'category') {
      db.get().collection(collections.PRODUCT_COLLECTION).updateMany({ category: coupon.value.category }, {
        $unset: { offer: 1 },
      });
    } else if (coupon.value.type == 'product') {
      db.get().collection(collections.PRODUCT_COLLECTION).updateMany({ _id: coupon.value.id }, {
        $unset: { offer: 1 },
      });
    }
    resolve();
  });
}
function editCoupon(id) {
  return new Promise(async (resolve, reject) => {
    const coupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({ _id: ObjectId(id) });
    resolve(coupon);
  });
}
function editCouponSubmit(id, data) {
  data.percentage = parseInt(data.percentage);
  data.limit = parseInt(data.limit);
  data.code = data.code.toUpperCase();
  console.log(data);
  return new Promise(async (resolve, reject) => {
    const res = await db.get().collection(collections.COUPON_COLLECTION).findOneAndUpdate({ _id: ObjectId(id) }, {
      $set: {
        name: data.name,
        code: data.code,
        startDate: data.startDate,
        endDate: data.endDate,
        percentage: data.percentage,
        limit: data.limit,
        isoDateStart: new Date(data.startDate),
        isoDateEnd: new Date(data.endDate),
      },
    }, { returnDocument: 'after' });
    console.log('>>>>>>>>', res, '<<<<<<<<<<<');
    if (res.value.type == 'category') {
      var samp = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
        {
          $match: { category: res.value.category },
        },
        {
          $project: { price: 1 },
        },

        {
          $addFields: {
            offer: { $subtract: ['$price', { $divide: [{ $multiply: ['$price', res.value.percentage] }, 100] }] },

          },
        },
      ]).forEach((element) => {
        db.get().collection(collections.PRODUCT_COLLECTION).updateMany({ _id: element._id }, {
          $set: {
            offer: element.offer,
          },
        });
      });
    } else if (res.value.type == 'product') {
      var samp = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
        {
          $match: { _id: res.value.id },
        },
        {
          $project: { price: 1 },
        },

        {
          $addFields: {
            offer: { $subtract: ['$price', { $divide: [{ $multiply: ['$price', res.value.percentage] }, 100] }] },

          },
        },
      ]).toArray();
      db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: res.value.id }, {
        $set: {
          offer: samp[0].offer,
        },
      });
    }

    resolve();
  });
}
function getSalesReport() {
  return new Promise(async (resolve, reject) => {
    const report = await db.get().collection(collections.ORDER_COLLECTION)
      .aggregate([
        {
          $match: { 'product.cartItem.deliveryStatus': 'Delivered' },
        },

        {
          $lookup: {
            from: 'books',
            localField: 'product.cartItem._id',
            foreignField: '_id',
            as: 'products',
          },
        },
        {
          $unwind: '$products',
        },
        {
          $project: {
            deliveryDetails: 1, totalPrice: 1, paymentMethod: 1, date: 1, products: 1,
          },
        },
      ]).toArray();
    console.log('>>>>>>>>>>', report);
    resolve(report);
  });
}
function filterSale(startDate, endDate) {
  return new Promise(async (resolve, reject) => {
    const sales = await db.get().collection(collections.ORDER_COLLECTION)
      .find({ $and: [{ 'product.cartItem.deliveryStatus': 'Delivered' }, { fullDate: { $lte: new Date(endDate) } }, { fullDate: { $gte: new Date(startDate) } }] }).toArray();
    if (sales.length != 0) {
      resolve(sales);
    } else {
      reject();
    }
  });
}
module.exports = {
  filterSale,
  getSalesReport,
  editCouponSubmit,
  editCoupon,
  romoveCoupon,
  getAllCoupons,
  createCoupon,
  getDailyOrder,
  deliveryStatusChange,
  cancelOrderAdminSubmit,
  viewSingleOrder,
  AllOrders,
  updateBookCategory,
  deleteByCategory,
  editCategorySub,
  removeCategory,
  addCategory,
  category,
  getBanner,
  addBanner,
  removeBook,
  doEditBook,
  getBook,
  getAllStocks,
  addStock,
  userBlockManage,
  getAllUsers,
  adminDoLogin,
  totalusers,
  getDailyRevenue,
  weeklyOrders,
  yearlyOrders,
  getWeeklyRevenue,
  getYearlyRevenue,
  revenueGraph,
};
