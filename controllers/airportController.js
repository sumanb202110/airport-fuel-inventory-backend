const mongoose = require("mongoose")
const Airport = require("../models/airport")




// Read operation
const getAirports = async (req, res, next) => {
    const page = req.query.page || 1
    const count = req.query.count || 100
    try {
        const result = await Airport.aggregate(
            [
                {
                  '$lookup': {
                    'from': 'airports_transactions', 
                    'localField': 'airport_id', 
                    'foreignField': '_id', 
                    'as': 'airport_transactions'
                  }
                }, {
                  '$unwind': {
                    'path': '$airport_transactions', 
                    'preserveNullAndEmptyArrays': true
                  }
                }, {
                  '$project': {
                    '_id': 1, 
                    'airport_id': '$airport_id', 
                    'airport_name': '$airport_name', 
                    'fuel_capacity': '$fuel_capacity', 
                    'fuel_available': '$fuel_available', 
                    'transactions': '$airport_transactions.transactions'
                  }
                }
              ]
        ).skip((parseInt(page) - 1) * parseInt(count)).limit(parseInt(count))
        const resultCount = await Airport.find().count()
        return res.status(200).json(
            {
            currentPage: page,
            itemsPerPage: result.length,
            totalPages: Math.ceil(resultCount/count),
            totalItems: resultCount,
            data:[...result.map((data) => {
                return {
                    airport_id: data.airport_id,
                    airport_name: data.airport_name,
                    fuel_capacity: data.fuel_capacity,
                    fuel_available: data.fuel_available,
                    transactions: data.transactions
                }
        })]})
    } catch (err) {
        console.log(err)
        res.status(400).json({
            msg: "Error"
        }).send()
    }
}

// Read operation
const getTransactionsByAirport = async (req, res, next) => {
    const page = req.query.page || 1
    const count = req.query.count || 5

    const airportId = req.params.airport_id
    try {
        const result = await Transaction.find({airport_id: airportId}).sort({transaction_date_time: -1}).skip((parseInt(page) - 1) * parseInt(count)).limit(parseInt(count))
        const resultCount = await Transaction.find().count()
        return res.status(200).json(
            {
            currentPage: page,
            itemsPerPage: result.length,
            totalPages: Math.ceil(resultCount/count),
            totalItems: resultCount,
            data: [...result.map((data) => {
            return {
                transaction_id: data.transaction_id,
                transaction_date_time: data.transaction_date_time,
                transaction_type: data.transaction_type,
                airport_id: data.airport_id,
                aircraft_id: data.aircraft_id,
                quantity: data.quantity,
                transaction_id_parent: data.transaction_id_parent
            }
        })
    ]
    })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            msg: "Error"
        }).send()
    }
}

// Read operation by id
const getAirportById = async (req, res, next) => {
    const airportId = req.params.airport_id
    try {
        const result = await Airport.findOne({airport_id: airportId})
        return res.status(200).json(
            {
                airport_id: result.airport_id,
                airport_name: result.airport_name,
                fuel_capacity: result.fuel_capacity,
                fuel_available: result.fuel_available
            })
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
        const createAirportResult = await airport.save()

        res.status(201).json({
                    airport_id: createAirportResult.airport_id,
                    airport_name: createAirportResult.airport_name,
                    fuel_capacity: createAirportResult.fuel_capacity,
                    fuel_available: createAirportResult.fuel_available,
                    transactions: createAirportResult.transactions
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
        const result = await Airport.findOneAndUpdate({ airport_id: req.params.airport_id },
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

// Airport report
const getAirportsReport = async (req, res, next) => {
    try {
        const resultAirportLTE20 = await Airport.aggregate(
            [
                {
                  '$project': {
                    'airport_id': 1, 
                    'airport_name': 1, 
                    'fuel_capacity': 1, 
                    'fuel_available': 1, 
                    'available_percentage': {
                      '$round': [
                        {
                          '$multiply': [
                            {
                              '$divide': [
                                '$fuel_available', '$fuel_capacity'
                              ]
                            }, 100
                          ]
                        }, 2
                      ]
                    }
                  }
                }, {
                  '$sort': {
                    'available_percentage': 1
                  }
                }, {
                  '$match': {
                    'available_percentage': {
                      '$lte': 20
                    }
                  }
                }
              ]
        )
        const resultAirportGTE80 = await Airport.aggregate(
        [
            {
                '$project': {
                'airport_id': 1, 
                'airport_name': 1, 
                'fuel_capacity': 1, 
                'fuel_available': 1, 
                'available_percentage': {
                    '$round': [
                    {
                        '$multiply': [
                        {
                            '$divide': [
                            '$fuel_available', '$fuel_capacity'
                            ]
                        }, 100
                        ]
                    }, 2
                    ]
                }
                }
            }, {
                '$sort': {
                'available_percentage': 1
                }
            }, {
                '$match': {
                'available_percentage': {
                    '$gte': 80
                }
                }
            }
            ]
        )
        return res.status(200).json(
            {
            
                airportLTE20:[...resultAirportLTE20.map((data) => {
                return {
                    airport_id: data.airport_id,
                    airport_name: data.airport_name,
                    fuel_capacity: data.fuel_capacity,
                    fuel_available: data.fuel_available,
                    available_percentage: data.available_percentage,

                }
                })],
                airportGTE80:[...resultAirportGTE80.map((data) => {
                    return {
                        airport_id: data.airport_id,
                        airport_name: data.airport_name,
                        fuel_capacity: data.fuel_capacity,
                        fuel_available: data.fuel_available,
                        available_percentage: data.available_percentage,

                    }
                })]
    })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            msg: "Error"
        }).send()
    }
}


module.exports = {
    getAirports,
    createAirport,
    updateAirport,
    deleteAirport,
    getAirportById,
    getTransactionsByAirport,
    getAirportsReport
}
