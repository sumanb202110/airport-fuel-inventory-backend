const mongoose = require("mongoose")
const Aircraft = require("../../models/aircraft")



// Read operation
const getAircraft = async (req, res, next) => {
    try {
        const result = await Aircraft.find()
        console.log(result)
        return res.status(200).json([...result.map((data) => {
            return {
                aircraft_id: data.aircraft_id,
                aircraft_no: data.aircraft_no,
                airline: data.airline
            }
        })]).send()
    } catch (err) {
        console.log(err)
        res.status(400).json({
            msg: "Error"
        }).send()
    }
}

// Create operation
const createAircraft = async (req, res, next) => {
    try {
        const aircraft = new Aircraft({
            aircraft_id: req.body.aircraft_id,
            aircraft_no: req.body.aircraft_no,
            airline: req.body.airline
        })
        const result = await aircraft.save()

        console.log(result)
        res.status(201).json({
            msg: "Aircraft successfully created"
        }).send()

    } catch (err) {
        console.log(err)
        if (err.code === 11000) {
            res.status(400).json({
                msg: "Duplicate entry"
            }).send()
        }
        res.status(400).json({
            msg: "Error"
        }).send()
    }
}


module.exports = {
    getAircraft,
    createAircraft
}
