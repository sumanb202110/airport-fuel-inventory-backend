const mongoose = require("mongoose")
const Airport = require("../../models/airport")



// Read operation
const getAirport = async (req, res, next) => {
    try {
        const result = await Airport.find()
        return res.status(200).json([...result.map((data) => {
            return {
                airport_id: data.airport_id,
                airport_name: data.airport_name,
                fuel_capacity: data.fuel_capacity,
                fuel_available: data.fuel_available
            }
        })])
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

        if (parseInt(req.body.fuel_available) > parseInt(req.body.fuel_capacity)) {
            return res.status(400).json({
                msg: "Fuel available can not be greater then fuel capacity"
            })
        }
        if (parseInt(req.body.fuel_available) < 0) {
            return res.status(400).json({
                msg: "Fuel available can not be negative"
            })
        }

        if (parseInt(req.body.fuel_capacity) < 0) {
            return res.status(400).json({
                msg: "Fuel available can not be negative"
            })
        }
        if (req.body.airport_id === "" || req.body.airport_id === undefined) {
            return res.status(400).json({
                msg: "Please provide airport id"
            })
        }
        if (req.body.airport_name === "" || req.body.airport_name === undefined) {
            return res.status(400).json({
                msg: "Please provide airport name"
            })
        }


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
        })

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

// Update operation
const updateAirport = async (req, res, next) => {
    try {

        if (parseInt(req.body.fuel_available) > parseInt(req.body.fuel_capacity)) {
            return res.status(400).json({
                msg: "Fuel available can not be greater then fuel capacity"
            })
        }
        if (parseInt(req.body.fuel_available) < 0) {
            return res.status(400).json({
                msg: "Fuel available can not be negative"
            })
        }

        if (parseInt(req.body.fuel_capacity) < 0) {
            return res.status(400).json({
                msg: "Fuel available can not be negative"
            })
        }
        if (req.body.airport_id === "" || req.body.airport_id === undefined) {
            return res.status(400).json({
                msg: "Please provide airport id"
            })
        }
        if (req.body.airport_name === "" || req.body.airport_name === undefined) {
            return res.status(400).json({
                msg: "Please provide airport name"
            })
        }


        const airport = new Airport({
            fuel_capacity: req.body.fuel_capacity,
            fuel_available: req.body.fuel_available
        })
        const result = await Airport.findOneAndUpdate({ airport_id: req.body.airport_id },
            {
                airport_name: req.body.airport_name,
                fuel_capacity: req.body.fuel_capacity,
                fuel_available: req.body.fuel_available
            }
        )

        console.log(result)
        res.status(200).json({
            msg: "Airport successfully updated"
        })

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

// Delete Airport
const deleteAirport = async (req, res, next) => {
    try {
        const result = await Airport.deleteOne({airport_id: req.params.airport_id})
        return res.status(204).send()
    } catch (err) {
        console.log(err)
        res.status(400).json({
            msg: "Error"
        }).send()
    }
}


module.exports = {
    getAirport,
    createAirport,
    updateAirport,
    deleteAirport
}
