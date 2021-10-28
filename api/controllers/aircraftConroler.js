const mongoose = require("mongoose")
const Aircraft = require("../../models/aircraft")



// Read operation
const getAircraft = async (req, res, next) => {
    try {
        const result = await Aircraft.find()
        return res.status(200).json([...result.map((data) => {
            return {
                aircraft_id: data.aircraft_id,
                aircraft_no: data.aircraft_no,
                airline: data.airline
            }
        })])
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
        const result = await aircraft.save()

        console.log(result)
        res.status(201).json({
            msg: "Aircraft successfully created"
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


module.exports = {
    getAircraft,
    createAircraft
}
