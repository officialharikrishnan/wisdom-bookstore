const { getCart, getTotalAmount } = require('../model/user-helpers');
const { tokenVerify } = require('./token');

function cartBooks(req) {
  const decode = tokenVerify(req);
  return getCart(decode.value.id).then((cart) => {
    return cart
  })
    .catch(() => {
      console.log('error to get cart');
    });
}
async function getTotalPrice(req) {
  const decode = tokenVerify(req);
  return getTotalAmount(decode.value.id).then((total) => total).catch(() => {
    console.log('get totel amount error');
    const total = null;
    return total;
  });
}
module.exports = { cartBooks, getTotalPrice };
