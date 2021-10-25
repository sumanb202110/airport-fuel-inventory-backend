const jwt = require("jsonwebtoken")

const jwtkey = process.env.JWT_KEY

const auth = (req, res, next) => {
    try {
        const token = req.headers.cookie.split('=')[1]
        const payload = jwt.verify(token, jwtkey)
        const email = payload.email
        if (!email) {
            return res.status(401).json({
                msg: "unauthorized access"
            }).send()
        }
        next()
    } catch (e) {
        console.log(e)
        return res.status(401).json({
            msg: "unauthorized access"
        }).send()
    }
}

module.exports = {
    auth
}