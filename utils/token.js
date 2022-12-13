const jwt = require('jsonwebtoken');
require('dotenv').config()
function tockenGenerator(data){
    const token = jwt.sign({ value: data }, process.env.JWT_KEY, { expiresIn: '10min' })
    return token;
}
function tokenVerify(request){
    const decode = jwt.verify(request.cookies.wisdom, process.env.JWT_KEY)
    return decode
}

module.exports = {tockenGenerator , tokenVerify}
   