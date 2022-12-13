const collections = require('./dbConnection/collection')
var db = require('../model/dbConnection/connection')
var bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
module.exports = {

    userSignup: (userData) => {
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
    }, 
    userLogin: (userData) => {
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
    },
    userBlockCheck:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({_id:ObjectId(userId)})
            console.log(user,userId,">>>>>>>>>>>>>>>>>>>>>");
            if(user.isBlocked){
                reject()
            }else{
                resolve()
            }
        })
    },
    getAllBooks:()=>{
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
    },
    findByNumber:(num)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({phone:num})
            if(user){
                resolve(user)
            }else{
                reject()
            }
        })
    },
    viewBook:(bookId)=>{
        return new Promise((resolve,reject)=>{
            let book = db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:ObjectId(bookId)})
            if(book){
                resolve(book)
            }else{
                reject()
            }
        })
    }


}