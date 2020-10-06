const { User } = require('../models/User')

let auth = (req, res, next) => {
    // 인증처리
    // 클라이언트 쿠키에서 토큰 get
    let token = req.cookies.x_auth;

    // 토큰 복호화 후 유저 get
    User.findByToken(token, (err,user) => {
        if(err) throw err;
        if(!user) return res.json({isAuth: false, error: true});
        req.token = token;
        req.user = user;
        next();
    })

    // 유저 있으면 인증 ok

    // 유저 없으면 인증 no


}

module.exports = { auth }