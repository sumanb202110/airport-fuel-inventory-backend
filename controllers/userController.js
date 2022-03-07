const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const Token = require("../models/token")


const jwtKey = process.env.JWT_KEY
const jwtRefreshKey = process.env.JWT_REFRESH_KEY
const jwtexpirySecond = 60 * 120

// Login operation
const login = async (req, res, next) => {
    try {
        const result = await User.find({ email: req.body.email })
        if(result[0] === undefined || result[0].password === undefined)
        {
            return res.status(401).json({ msg: "Invalid user email" }).send()
        }

        if (result) {
            bcrypt.compare(req.body.password, result[0].password).then(
                async (valid) => {
                    if (!valid) {
                        return res.status(401).json({ msg: "Incorrect password" }).send()
                    }

                    // Generate jwt token
                    const token = jwt.sign({ email: result[0].email }, jwtKey, {
                        algorithm: "HS256",
                        expiresIn: jwtexpirySecond
                    })

                    // Generate refres jwt token
                    const refreshToken = jwt.sign({ email: result[0].email }, jwtRefreshKey, {
                        algorithm: "HS256",
                        expiresIn: jwtexpirySecond
                    })

                    const refreshTokenDbObj = new Token({
                        token: refreshToken
                    })

                    const refreshTokenSaveRes = await refreshTokenDbObj.save()

                    // Set token to cookie
                    // res.cookie("token", token, { maxAge: jwtexpirySecond * 1000 })

                    res.status(200).json({
                        token: token,
                        refreshToken: refreshToken
                    }).send()
                }
            )
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({
            msg: "Error"
        }).send()
    }
}

// Refresh operation
const refresh = async (req, res, next) => {
    try{
        // Generate jwt token
        const token = jwt.sign({ email: req.userEmail }, jwtKey, {
            algorithm: "HS256",
            expiresIn: jwtexpirySecond
        })

        // Generate refres jwt token
        const refreshToken = jwt.sign({ email: req.userEmail }, jwtRefreshKey, {
            algorithm: "HS256",
            expiresIn: jwtexpirySecond
        })

       

        const refreshTokenSaveRes = await Token.findOneAndUpdate({ token: req.body.refreshToken },{token: refreshToken})

        // Set token to cookie
        // res.cookie("token", token, { maxAge: jwtexpirySecond * 1000 })

        res.status(200).json({
            token: token,
            refreshToken: refreshToken
        }).send()
             
    } catch (err) {
        console.log(err)
        res.status(400).json({
            msg: "Error"
        }).send()
    }
}


// Logout
const logout = async(req, res, next) => {
    // res.cookie("token", "", { maxAge: -100000 })
    const tokenDeleteRes = await Token.deleteOne({token: req.body.refreshToken})
    res.status(200).json({
        msg: "Logout"
    }).send()
}

// Create operation
const createUser = async (req, res, next) => {
    // Email validation function
    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

     // Password check
     const validatePassword = (password) => {
        const re = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&-+=()])(?=\\S+$).{8, 20}$/
        return re.test(password);
    }
    if(!validateEmail(req.body.email)){
        res.status(400).json({
            msg: "Invalid email"
        }).send()
    }
    if(!validatePassword(req.body.password)){
        res.status(400).json({
            msg: `Password must be of length 8 to 30 which contains one digit, one uppercase alphabet, one lower case alphabet,
            one special character which includes !@#$%&*()-+=^ and does not contain any white space`
        }).send()
    }
    try {
        await bcrypt.hash(req.body.password, 10).then(
            async (hash) => {
                const user = new User({
                    user_id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    email: req.body.email,
                    password: hash
                })

                const result = await user.save()

                if (result.email === user.email) {
                    res.status(200).json({
                        msg: "New user created successfully."
                    }).send()
                }
            })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            msg: "Error"
        }).send()
    }
}



module.exports = {
    login,
    logout,
    createUser,
    refresh
}