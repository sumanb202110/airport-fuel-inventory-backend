const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Token = require("../models/token");
const user = require("../services/user.service");

const jwtKey = process.env.JWT_KEY;     // eslint-disable-line
const jwtRefreshKey = process.env.JWT_REFRESH_KEY;      // eslint-disable-line
const jwtexpirySecond = 60 * 120;

/**
 * User login
 * 
 * @function
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
const login = async (req, res) => {
    try {
        const result = await user.findUser(req.body.email);
        if (result === undefined || result.password === undefined) {
            return res.status(401).json({ msg: "Invalid user email" }).send();
        }

        if (result) {
            bcrypt.compare(req.body.password, result.password).then(
                async (valid) => {
                    if (!valid) {
                        return res.status(401).json({ msg: "Incorrect password" }).send();
                    }

                    // Generate jwt token
                    const token = jwt.sign({ email: result.email }, jwtKey, {
                        algorithm: "HS256",
                        expiresIn: jwtexpirySecond
                    });

                    // Generate refres jwt token
                    const refreshToken = jwt.sign({ email: result.email }, jwtRefreshKey, {
                        algorithm: "HS256",
                        expiresIn: jwtexpirySecond
                    });

                    await user.saveRefreshToken(refreshToken);

                    // Set token to cookie
                    // res.cookie("token", token, { maxAge: jwtexpirySecond * 1000 })

                    res.status(200).json({
                        token: token,
                        refreshToken: refreshToken
                    }).send();
                }
            );
        }
    } catch (err) {
        res.status(400).json({
            msg: "Error"
        }).send();
    }
};

/**
 * Token Refresh
 * 
 * @function
 * @param {Object} req 
 * @param {Object} res 
 */
const refresh = async (req, res) => {
    try {
        // Generate jwt token
        const token = jwt.sign({ email: req.userEmail }, jwtKey, {
            algorithm: "HS256",
            expiresIn: jwtexpirySecond
        });

        // Generate refres jwt token
        const refreshToken = jwt.sign({ email: req.userEmail }, jwtRefreshKey, {
            algorithm: "HS256",
            expiresIn: jwtexpirySecond
        });

        await user.updateRefreshToken(req.body.refreshToken, refreshToken);

        // Set token to cookie
        // res.cookie("token", token, { maxAge: jwtexpirySecond * 1000 })

        res.status(200).json({
            token: token,
            refreshToken: refreshToken
        }).send();

    } catch (err) {
        res.status(400).json({
            msg: "Error"
        }).send();
    }
};


/**
 * Logout user
 * 
 * @function
 * @param {Object} req 
 * @param {Object} res 
 */
const logout = async (req, res) => {
    // res.cookie("token", "", { maxAge: -100000 })
    await Token.deleteOne({ token: req.body.refreshToken });
    res.status(200).json({
        msg: "Logout"
    }).send();
};

/**
 * Create new user
 * 
 * @function
 * @param {Object} req 
 * @param {Object} res 
 */
const createUser = async (req, res) => {
    // Email validation function
    const validateEmail = (email) => {
        // eslint-disable-next-line
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    // Password check
    const validatePassword = (password) => {
        const re = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&-+=()])(?=\\S+$).{8, 20}$/;
        return re.test(password);
    };
    if (!validateEmail(req.body.email)) {
        res.status(400).json({
            msg: "Invalid email"
        }).send();
    }
    if (!validatePassword(req.body.password)) {
        res.status(400).json({
            msg: `Password must be of length 8 to 30 which contains one digit, one uppercase alphabet, one lower case alphabet,
            one special character which includes !@#$%&*()-+=^ and does not contain any white space`
        }).send();
    }
    try {
        await bcrypt.hash(req.body.password, 10).then(
            async (hash) => {
                const userData = {
                    name: req.body.name,
                    email: req.body.email,
                    password: hash
                };

                res.status(201).json(await user.createUser(userData));
            });
    } catch (err) {
        res.status(400).json(err).send();
    }
};



module.exports = {
    login,
    logout,
    createUser,
    refresh
};