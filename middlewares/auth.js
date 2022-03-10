const jwt = require("jsonwebtoken");

// eslint-disable-next-line
const jwtkey = process.env.JWT_KEY;

const auth = (req, res, next) => {
    try {
        const authHeader = req?.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if(token == null) return res.status(401).send();

        jwt.verify(token, jwtkey, (err, email) => {
            if(err) return res.status(403).send();
            req.userEmail = email;
            next();
        });
    }catch (e) {
        return res.status(401).json({
            msg: "unauthorized access"
        }).send();
    }
};

module.exports = {
    auth
};