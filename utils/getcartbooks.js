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
async function getTotelPrice(req,res){
    let decode = tokenVerify(req)
    return getTotelAmount(decode.value.id).then((totel)=>{
        return totel
    }).catch((totel)=>{
        console.log("get totel amount error");
        return totel=null
    })
}
module.exports={cartBooks,getTotelPrice} 