const mongoose = require("mongoose")

const airportSchema = mongoose.Schema({
    airport_id: { type: String, require: true },
    airport_name: { type: String, require: true },
    fuel_capacity: Number,
    fuel_available: Number

})

module.exports = mongoose.model('Airport', airportSchema)