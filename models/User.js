const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function(next){
    var user = this;

    if(user.isModified('password')){
        // password 암호화
        bcrypt.genSalt(saltRounds, function (err, salt){
            if(err) return next(err)

            bcrypt.hash(user.password, salt, function (err, hash){
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function(err, isMath) {
        if(err) return cb(err)
        cb(null, isMath)
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this;
    // jsonwebtoken 으로 token 생성.
    var token = jwt.sign(user._id.toHexString(), 'secretToke')

    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;
    // 토큰 decode
    jwt.verify(token, 'secretToke', function(err, decoded) {
        // 유저아이디로 유저 get
        // token 일치확인
        user.findOne({"_id": decoded, "token": token}, function(err, user){
            if(err) return cb(err)
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = {User}