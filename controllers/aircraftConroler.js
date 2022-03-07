const mongoose = require("mongoose")
const Aircraft = require("../models/aircraft")



// Read operation
const getAircrafts = async (req, res, next) => {
    const page = req.query.page || 1
    const count = req.query.count || 100
    try {
        const result = await Aircraft.find().skip((parseInt(page) - 1) * parseInt(count)).limit(parseInt(count))
        const resultCount = await Aircraft.find().count()
        return res.status(200).json(
            {
            currentPage: page,
            itemsPerPage: result.length,
            totalPages: Math.ceil(resultCount/count),
            totalItems: resultCount,
            data: [...result.map((data) => {
            return {
                aircraft_id: data.aircraft_id,
                aircraft_no: data.aircraft_no,
                airline: data.airline
            }
        })]})
    } catch (err) {
        console.log(err)
        res.status(400).json({
            msg: "Error"
        })
    }
}

// Read operation by id
const getAircraftById = async (req, res, next) => {
    const aircraftId = req.params.aircraft_id
    try {
        const result = await Aircraft.findOne({aircraft_id: aircraftId})
        return res.status(200).json({
                aircraft_id: result.aircraft_id,
                aircraft_no: result.aircraft_no,
                airline: result.airline
            })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            msg: "Error"
        })
    }
}

// Create operation
const createAircraft = async (req, res, next) => {
    try {

        if(req.body.aircraft_id === "" || req.body.aircraft_id === undefined){
            return  res.status(400).json({
                msg: "Please provide aircraft id"
            })
        }

        if(req.body.aircraft_no === "" || req.body.aircraft_no === undefined){
            return  res.status(400).json({
                msg: "Please provide aircraft no"
            })
        }

        if(req.body.airline === "" || req.body.airline === undefined){
            return  res.status(400).json({
                msg: "Please provide airline"
            })
        }
        

        const aircraft = new Aircraft({
            aircraft_id: req.body.aircraft_id,
            aircraft_no: req.body.aircraft_no,
            airline: req.body.airline
        })
        const createAircraftResult = await aircraft.save()

        res.status(201).json({
            aircraft_id: createAircraftResult.aircraft_id,
            aircraft_no: createAircraftResult.aircraft_no,
            airline: createAircraftResult.airline
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
const updateAircraft = async (req, res, next) => {
    try {

        if(req.body.aircraft_id === "" || req.body.aircraft_id === undefined){
            return  res.status(400).json({
                msg: "Please provide aircraft id"
            })
        }

        if(req.body.aircraft_no === "" || req.body.aircraft_no === undefined){
            return  res.status(400).json({
                msg: "Please provide aircraft no"
            })
        }

        if(req.body.airline === "" || req.body.airline === undefined){
            return  res.status(400).json({
                msg: "Please provide airline"
            })
        }
        

      
        const result = await Aircraft.findOneAndUpdate({aircraft_id: req.body.aircraft_id},{
            aircraft_no: req.body.aircraft_no,
            airline: req.body.airline
        })
        console.log(result)
        res.status(200).json({
            msg: "Aircraft successfully Updated"
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

// Delete operation
const deleteAircraft = async (req, res, next) => {
    try {
        const result = await Aircraft.deleteOne({aircraft_id: req.params.aircraft_id})
        return res.status(204).send()
    } catch (err) {
        console.log(err)
        res.status(400).json({
            msg: "Error"
        })
    }
}


module.exports = {
    getAircrafts,
    createAircraft,
    updateAircraft,
    deleteAircraft,
    getAircraftById
}
