const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    password: String

});

module.exports = mongoose.model("User", userSchema);
