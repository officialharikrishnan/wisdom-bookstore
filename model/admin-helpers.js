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
          product: 1,
          deliveryDetails: 1,
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
    console.log(singleOrder);
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
function deliveryStatusChange(orderId, status) {
  console.log(orderId, status);
  return new Promise(async (resolve, reject) => {
    await db.get().collection(collections.ORDER_COLLECTION)
      .updateOne({ _id: ObjectId(orderId) }, {
        $set: {
          deliveryStatus: status,
        },
      }).then(() => {
        resolve();
      })
      .catch(() => {
        reject();
      });
  });
}
module.exports = {
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
};
