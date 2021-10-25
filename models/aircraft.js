const mongoose = require("mongoose")

const aircraftSchema = mongoose.Schema({
    aircraft_id: { type: String, require: true },
    aircraft_no: { type: String, require: true },
    airline: String
})

module.exports = mongoose.model('Aircraft', aircraftSchema)