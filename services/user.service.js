const mongoose = require("mongoose");
const User = require("../models/user");
const Token = require("../models/token");

/**
 * Find user in database
 * 
 * @function
 * @param {String} userEmail 
 * @returns 
 */
const findUser = async (userEmail) => {
    try {
        const result = await User.find({ email: userEmail });
        return {
            name: result[0].name,
            email: result[0].email,
            password: result[0].password
        };
    }catch(err){
        throw{
            msg: "error"
        };
    }
};

/**
 * Save Refreshed token in database
 * 
 * @function
 * @param {String} refreshToken 
 * @returns 
 */
const saveRefreshToken = async (refreshToken) => {
    try {
        const refreshTokenDbObj = new Token({
            token: refreshToken
        });

        await refreshTokenDbObj.save();
        return;

    }catch(err){
        throw{
            msg: "error"
        };
    }
};

/**
 * Replace refresh token in database
 * 
 * @function
 * @param {String} oldRefreshToken 
 * @param {String} refreshToken 
 * @returns 
 */
const updateRefreshToken = async (oldRefreshToken, refreshToken) => {
    try {
        await Token.findOneAndUpdate({ token: oldRefreshToken },{token: refreshToken});

        return;

    }catch(err){
        throw{
            msg: "error"
        };
    }
};

/**
 * Delete specific refresh token from database
 * 
 * @function
 * @param {String} refreshToken 
 * @returns 
 */
const deleteRefreshToken = async (refreshToken) => {
    try {
        await Token.deleteOne({token: refreshToken});
        return;

    }catch(err){
        throw{
            msg: "error"
        };
    }
};

/**
 * Insert new user detils to the database
 * 
 * @function
 * @param {Object} userData 
 * @returns 
 */
const createUser = async (userData) => {
    try {
        const user = new User({
            user_id: new mongoose.Types.ObjectId(),
            name: userData.name,
            email: userData.email,
            password: userData
        });

        const result = await user.save();

        if (result.email === user.email) {
            return{
                msg: "New user created successfully."
            };
        }
    }catch(err){
        throw{
            msg: "error"
        };
    }
};
module.exports = {
    findUser,
    saveRefreshToken,
    updateRefreshToken,
    deleteRefreshToken,
    createUser
};