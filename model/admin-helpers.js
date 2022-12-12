const collections = require('./dbConnection/collection')
var db = require('../model/dbConnection/connection')
var bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')

module.exports={
    adminDoLogin: (data) => {
        return new Promise(async(resolve, reject) => {
            var res =await db.get().collection(collections.ADMIN_COLLECTION).findOne({ email: data.email })
            if(res){
                bcrypt.compare(data.password,res.password).then((result)=>{
                    if(result){
                        let data={
                            name:res.adminId,
                        }
                        resolve(data)
                    }else{
                        reject({error:"Invalid password"})
                    }
                })
            }else{
                reject({error:"Invalied email"})
            }
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            var users=await db.get().collection(collections.USER_COLLECTION).find().toArray()
            if(users.length != 0){
                resolve(users)
            }else{
                reject()
            }
        })
    },
    userBlockManage:(userId,status)=>{
        var update
        if(status=='true'){
            update=false
        }else{
            update=true
        }
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
                $set:{
                    isBlocked:update
                }
            }).then(()=>{
                resolve()
            })

        }).catch((err)=>{
            console.log(err);
        })
    },
    addStock:(product)=>{
        console.log(product);
        return new Promise(async(resolve,reject)=>{
           var book =await db.get().collection(collections.PRODUCT_COLLECTION).insertOne(product)
           console.log("book",book);
           let data={
            id:book.insertedId
           }
           if(book){
           resolve(data)
           }else{
            reject()
           }
        }).catch((err)=>{
            console.log(err);
        })
    },
    getAllStocks:()=>{
        return new Promise(async(resolve,reject)=>{
            var books = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            resolve(books)
        })
    },
    getBook:(bookId)=>{
        return new Promise(async(resolve,reject)=>{
            var book = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:ObjectId(bookId)})
            if(book){
                resolve(book)
            }else{
                reject()
            }
        })
    },
    doEditBook:(bookdata,bookId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:ObjectId(bookId)},{
                $set:{
                    bookname:bookdata.bookname,
                    authorname:bookdata.authorname,
                    aboutbook:bookdata.aboutbook,
                    aboutauthor:bookdata.aboutauthor,
                    category:bookdata.category,
                    language:bookdata.language,
                    dateofpublish:bookdata.dateofpublish,
                    price:bookdata.price
                }
            })
            resolve(bookdata.category)
        }).catch((err)=>{
            console.log(err);
        })
    },
    removeBook:(bookId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({_id:ObjectId(bookId)}).then(()=>{
                resolve()
            })
        })
    },
    addBanner:(imageName)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.BANNER_COLLECTION).insertOne(imageName).then(()=>{
                resolve()
            })
        })
    },
    getBanner:()=>{
        return new Promise(async(resolve,reject)=>{
           let response =await  db.get().collection(collections.BANNER_COLLECTION).find().toArray()
           resolve(response[0])
        })
    },
    category:()=>{
        return new Promise(async(resolve,reject)=>{
            let category = await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
            if(category.length != 0 ){
                resolve(category)
            }else{
                reject()
            }
        })
    },
    addCategory:(data)=>{

        data = data.toLowerCase()
        return new Promise(async(resolve,reject)=>{
            let exist=await db.get().collection(collections.CATEGORY_COLLECTION).findOne({name:data})
            if(exist){
                reject({err:"edit category error find"})
            }else{
            db.get().collection(collections.CATEGORY_COLLECTION).insertOne({name:data})
            resolve()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },
    removeCategory:(id)=>{
        return new Promise(async(resolve,reject)=>{
            var deleted =await db.get().collection(collections.CATEGORY_COLLECTION).findOneAndDelete({_id:ObjectId(id)})
            resolve(deleted)
        })
    },
    editCategorySub:(id,data)=>{
        return new Promise(async(resolve,reject)=>{
            var oldCategory =await db.get().collection(collections.CATEGORY_COLLECTION).findOneAndUpdate({_id:ObjectId(id)},{
                $set:{
                    name:data
                }
            })
            resolve(oldCategory.value.name)
        })
    },
    deleteByCategory:(data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).deleteMany({category:data.value.name})
            resolve()
        })
    },
    updateBookCategory:(old,newcategory)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).updateMany({category:old},{
                $set:{
                    category:newcategory
                }
            })
            resolve()
        })
    }
}