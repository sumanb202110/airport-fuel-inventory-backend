const mongoose = require("mongoose")
const Airport = require("../../models/airport")



// Read operation
const getAirport = async (req, res, next) => {
    try {
        const result = await Airport.find()
        console.log(result)
        return res.status(200).json([...result.map((data) => {
            return {
                airport_id: data.airport_id,
                airport_name: data.airport_name,
                fuel_capacity: data.fuel_capacity,
                fuel_available: data.fuel_available
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
const createAirport = async (req, res, next) => {
    try {
        const airport = new Airport({
            airport_id: req.body.airport_id,
            airport_name: req.body.airport_name,
            fuel_capacity: req.body.fuel_capacity,
            fuel_available: req.body.fuel_available
        })
        const result = await airport.save()

        console.log(result)
        res.status(201).json({
            msg: "Airport successfully created"
        }).send()

    } catch (err) {
        console.log(err)
        if (err.code === 11000) {
            return res.status(400).json({
                msg: "Duplicate entry"
            }).send()
        }
        res.status(400).json({
            msg: "Error"
        }).send()
    }
}


module.exports = {
    getAirport,
    createAirport
}
