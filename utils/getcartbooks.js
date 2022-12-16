const { getCart, getTotelAmount } = require("../model/user-helpers");
const { tokenVerify } = require("./token");

function cartBooks(req){
    let decode = tokenVerify(req)
    let cartItem;
    return getCart(decode.value.id).then((cart)=>{
        return cartItem=cart
    }).catch(()=>{
        console.log("error to get cart");
    })
}
function getTotelPrice(req,res){
    let decode = tokenVerify(req)
    return getTotelAmount(decode.value.id).then((totel)=>{
        return totel
    }).catch((err)=>{
        console.log("get totel amount error");
    })
}
module.exports={cartBooks,getTotelPrice} 