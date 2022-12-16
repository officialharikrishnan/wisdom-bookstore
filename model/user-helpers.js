const collections = require('./dbConnection/collection')
var db = require('../model/dbConnection/connection')
var bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const e = require('express')


    function userSignup (userData) {
        userData.createdAt=new Date().toDateString()
        userData.isBlocked=false
        userData.phone=`+91${userData.phone}`
        return new Promise(async (resolve, reject) => {

            var user = await db.get().collection(collections.USER_COLLECTION).findOne({
                $or:[
                    {
                        email:userData.email
                    },
                    {
                        phone:userData.phone
                    }
                ]
            })
            if(user){
                reject({error:"user already exist"})
            }else{

                userData.password = await bcrypt.hash(userData.password, 10)
                var res =await db.get().collection(collections.USER_COLLECTION).insertOne(userData)
                if(res.insertedId){
                    let data={
                        name:userData.username,
                        id:res.insertedId
                    }
                    resolve(data)
                }else{
                    reject()
                }
            }


        })
    }
    function userLogin(userData){
        return new Promise(async(resolve, reject) => {
            var res =await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email })
            if(res){
                if(res.isBlocked){
                    reject({error:"This user have been blocked"})
                }else{

                bcrypt.compare(userData.password,res.password).then((result)=>{
                    if(result){
                        let data={
                            name:res.username,
                            id:res._id
                        }
                        console.log(">>>",data);
                        resolve(data)
                    }else{
                        reject({error:"Wrong password"})
                    }
                })
                }
            }else{
                reject({error:"Invalied User"})
            }
        })
    }
    function userBlockCheck(userId){
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({_id:ObjectId(userId)})
            console.log(user,userId,">>>>>>>>>>>>>>>>>>>>>");
            if(user.isBlocked){
                reject()
            }else{
                resolve()
            }
        })
    }
    function getAllBooks(){
        return new Promise(async(resolve,reject)=>{
            try{
            var all = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            var history = await db.get().collection(collections.PRODUCT_COLLECTION).find({category:'history'}).toArray()
            var romance = await db.get().collection(collections.PRODUCT_COLLECTION).find({category:'romance'}).toArray()
            var fantasy = await db.get().collection(collections.PRODUCT_COLLECTION).find({category:'fantasy'}).toArray()
            var kids = await db.get().collection(collections.PRODUCT_COLLECTION).find({category:'kids'}).toArray()
            var banner = await db.get().collection(collections.BANNER_COLLECTION).find().toArray()
            
            if(all.length != 0 ){
                let data={
                    all:all,
                    history:history,
                    romance:romance,
                    fantasy:fantasy,
                    kids:kids,
                    banner:banner[0]
                } 
                console.log("resolve////////");
                resolve(data)
            }else{
                console.log(">>>>>> catch worked");
                reject()
            }
        }catch(err){
            console.log(err);
        }
        })
    }
    function findByNumber(num){
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({phone:num})
            if(user){
                resolve(user)
            }else{
                reject()
            }
        })
    }
    function viewBook(bookId){
        return new Promise((resolve,reject)=>{
            let book = db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:ObjectId(bookId)})
            if(book){
                resolve(book)
            }else{
                reject()
            }
        })
    }
    function addToCart(proId,userId){
        let proObj={
            item:ObjectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(userCart){
                console.log(userCart);
                proExist=userCart.books.findIndex(book =>{ 
                    return book.item == proId
                })
                console.log(proExist);
                if(proExist != -1){
                    console.log("calling");
                    db.get().collection(collections.CART_COLLECTION).updateOne({user:ObjectId(userId),"books.item":ObjectId(proId)},{
                        $inc:{"books.$.quantity":1}
                    }).then(()=>{
                        resolve()
                    })
                }else{
                    db.get().collection(collections.CART_COLLECTION).updateOne({user:ObjectId(userId)},{
                        $push:{
                            books:proObj
                        }
                    }).then(()=>{
                        resolve()
                    })
                }

            }else{
                let cart={
                    user:ObjectId(userId),
                    books:[proObj]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cart).then(()=>{
                    resolve()
                })
            }
        })
    }
    function getCart(userId){
        return new Promise(async(resolve,reject)=>{
             
            var cartItems=await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match:{
                        user:ObjectId(userId)
                    }
                },
                {
                    $unwind:"$books"
                },
                {
                    $project:{
                        item:"$books.item",
                        quantity:"$books.quantity"
                    }
                },
                {
                    $lookup:{
                        from:"books",
                        localField:"item",
                        foreignField:"_id",
                        as:"cartItem"
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,book:{$arrayElemAt:["$cartItem",0]}
                    }
                }
            ]).toArray()
            // console.log(">>>",cartItems[0].cartItem);
            if(cartItems){
                resolve(cartItems) 
            }else{
                reject()
            } 
        })
    }
     function changeBookQuantity(details){
        console.log(details);
        let count=parseInt(details.count)
        return new Promise(async(resolve,reject)=>{
            
            if(count == -1 && details.quantity == 1){

                db.get().collection(collections.CART_COLLECTION).updateOne({$and:[{_id:ObjectId(details.cart)},{"books.item":ObjectId(details.product)}]},{
                    $pull:{
                        books:{item:ObjectId(details.product)}
                    }
                }).then(()=>{
                    resolve()
                })

            }else{      
                db.get().collection(collections.CART_COLLECTION).updateOne({$and:[{_id:ObjectId(details.cart)},{"books.item":ObjectId(details.product)}]},{
                    $inc:{
                        "books.$.quantity":count
                    }
                }).then(()=>{
                    resolve()
                })
                
            }
    })
}
function getTotelAmount(userId){
    return new Promise(async(resolve,reject)=>{
        var totel=await db.get().collection(collections.CART_COLLECTION).aggregate([
            {
                $match:{
                    user:ObjectId(userId)
                }
            },
            {
                $unwind:"$books"
            },
            {
                $project:{
                    item:"$books.item",
                    quantity:"$books.quantity"
                }
            },
            {
                $lookup:{
                    from:"books",
                    localField:"item",
                    foreignField:"_id",
                    as:"cartItem"
                }
            },
            {
                $project:{
                    item:1,quantity:1,book:{$arrayElemAt:["$cartItem",0]}
                }
            },
            {  
                $group:{
                    _id:null,
                    totel:{$sum:{$multiply:["$quantity","$book.price"]}}
                }
            }
        ]).toArray()
        if(totel[0]?.totel){
        resolve(totel[0]?.totel)
        }else{
            reject()
        }
    })
}
function loadCurrentAddress(userId){
    return new Promise(async(resolve,reject)=>{

        var user =await db.get().collection(collections.USER_COLLECTION).findOne({_id:ObjectId(userId)})
        if(user.address){
            resolve(user.address)
        }else{
            reject()
        }

    })
}
function getAccountInfo(userId){
    return new Promise(async(resolve,reject)=>{
        var info = await db.get().collection(collections.USER_COLLECTION).findOne({_id:ObjectId(userId)})
        if(info){
            resolve(info)
        }else{
            reject()
        }
    })
}
function getCartProducts(userId){
    return new Promise((resolve,reject)=>{
        let cart = db.get().collection(collections.CART_COLLECTION).findOne()
        resolve(cart)
    })
}
function placeOrder(userId,cart,order,status){
   console.log(userId,cart,order,status);
   let orderObj={
    user:ObjectId(userId),
    deliveryDetails:{
        name:order.name,
        street:order.street,
        street2:order.street2,
        town:order.town,
        postcode:order.postcode,
        phone:order.phone,
        email:order.email
    },
    paymentMethod:order.payment,
    date: new Date().toDateString(),
    status:status
   }
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then(()=>{
            resolve()
        })
    })
}
function removeCartAfterOrder(userId){
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.CART_COLLECTION).deleteOne({user:ObjectId(userId)}).then(()=>{
            resolve()
        })
    })
}
        

module.exports={removeCartAfterOrder,loadCurrentAddress,placeOrder,getCartProducts,getAccountInfo,getTotelAmount,changeBookQuantity,getCart,userSignup,userLogin,userBlockCheck,getAllBooks,findByNumber,viewBook,addToCart}