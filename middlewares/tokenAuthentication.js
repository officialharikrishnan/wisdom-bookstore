const jwt = require('jsonwebtoken');
const { userBlockCheck } = require('../model/user-helpers');
const { tokenVerify } = require('../utils/token');

function authorization(req, res, next) {
  const token = req.cookies.wisdom;
  if (!token) {
    return res.render('userView/login');
  }
  console.log('tocken accessed>>>>');
  try {
    const data = tokenVerify(req);
    if (data) {
      const decode = tokenVerify(req);
      console.log(decode, '????>>>>>');

      userBlockCheck(decode.value.id).then(() => {
        next();
      })
        .catch(() => {
          res.render('userView/login', { error: 'This account is blocked' });
        });
    } else {
      res.render('userView/login');
    }
  } catch {
    return res.render('userView/login');
  }
}
function landingAuthorization(req, res, next) {
  const token = req.cookies.wisdom;
  if (!token) {
    next();
  } else {
    try {
      const data = jwt.verify(token, process.env.JWT_KEY);
      if (data) {
        res.redirect('/home');
      } else {
        next();
      }
    } catch {
      next();
    }
  }
}
function adminAuthorization(req, res, next) {
  const token = req.cookies.auth;
  if (!token) {
    return res.redirect('/admin');
  }
  try {
    const data = jwt.verify(token, process.env.JWT_KEY);
    if (data) {
      next();
    } else {
      res.redirect('/admin');
    }
  } catch {
    return res.redirect('/admin');
  }
}

module.exports = { authorization, landingAuthorization, adminAuthorization };
