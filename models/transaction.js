const mongoose = require("mongoose")

const transactionSchema = mongoose.Schema({
    transaction_id: mongoose.Schema.Types.ObjectId,
    transaction_date_time: { type: Date, default: Date.now },
    transaction_type: String,
    airport_id: String,
    aircraft_id: String,
    quantity: String,
    transaction_id_parent: String
})

module.exports = mongoose.model('Transacion', transactionSchema)