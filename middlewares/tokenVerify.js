var jwt = require('jsonwebtoken');
const { userBlockCheck } = require('../model/user-helpers');
const { tokenVerify } = require('../utils/token');


function authorization (req, res, next){
    const token = req.cookies.wisdom;
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>",token);
    if (!token) {
        return res.render('userView/login');
    } else {
        console.log("tocken accessed>>>>");
        try {
            const data = tokenVerify(req)
            if (data) {
                const decode = tokenVerify(req)
                userBlockCheck(decode.value.id).then(()=>{
                    next()
                }) 
                .catch(()=>{
                res.render('userView/login',{error:'This account is blocked'})
                })
            } else {
                res.render('userView/login')
            }
        } catch {
            return res.render('userView/login')
        }
    }
}

module.exports={
    authorization
}