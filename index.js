const { response } = require('express')
const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')

const { User } = require('./models/User')
const { auth } = require('./middleware/auth')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World!'))

app.post('/api/users/register', (req, res) =>{

    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/api/users/login', (req, res) => {
    // 요청된 email db에서 찾기
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "해당 하는 이메일이 없습니다."
            })
        }

        // 해당 email 있으면 password check
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
            return res.json({loginSuccess: false, message: "비밀번호가 불일치"})

            // password 맞으면 토큰 생성.
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
                // 토큰을 저장한다.
                res.cookie("x_auth", user.token)
                .status(200)
                .json({loginSuccess: true, userId: user._id})
            })

        })

    })

})

app.get('/api/users/auth', auth,  (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})


app.get('/api/users/logout', auth, (req, res) => {
    console.log("req:" + req.user._id)
    User.findOneAndUpdate({_id: req.user._id}, {token:""}, (err, user) => {
            if(err) return res.json({success: false, err});
            return res.status(200).send({
                success:true
            })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))