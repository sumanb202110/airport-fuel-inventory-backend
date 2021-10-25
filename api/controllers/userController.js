const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../../models/user")

const jwtkey = process.env.JWT_KEY
const jwtexpirySecond = 3600 * 24

// Read operation
const login = async (req, res, next) => {
    try {
        const result = await User.find({ email: req.body.email })

        if (result) {
            bcrypt.compare(req.body.password, result[0].password).then(
                (valid) => {
                    if (!valid) {
                        return res.status(401).json({ msg: "Incorrect password" }).send()
                    }

                    // Generate jwt token
                    const token = jwt.sign({ email: result[0].email }, jwtkey, {
                        algorithm: "HS256",
                        expiresIn: jwtexpirySecond
                    })
                    // Set token to cookie
                    res.cookie("token", token, { maxAge: jwtexpirySecond * 1000 })

                    res.status(200).json({
                        email: result[0].email,
                        msg: "Successfully logedin"
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


// Logout
const logout = (req, res, next) => {
    res.cookie("token", "", { maxAge: -100000 })
    res.status(200).json({
        msg: "Logout"
    }).send()
}

// Create operation
const createUser = async (req, res, next) => {
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
    createUser
}