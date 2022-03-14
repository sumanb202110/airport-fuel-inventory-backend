// const mongoose = require("mongoose");
const Airport = require("../models/airport");
// const Transaction = require("../models/transaction");
const airport = require("../services/airport.service");






// Read operation
const getAirports = async (req, res) => {
    const page = req.query.page || 1;
    const count = req.query.count || 100;
    try {
        res.status(200).json(await airport.getAirports(page, count));
    }catch (err) {
        res.status(400).json(err).send();
    }
};

// Read operation
const getTransactionsByAirport = async (req, res) => {
    const page = req.query.page || 1;
    const count = req.query.count || 5;

    const airportId = req.params.airport_id;
    try {
        res.status(200).json(await airport.getTransactionsByAirport(page, count, airportId));
    }catch (err) {
        res.status(400).json(err).send();
    }
};

// Read operation by id
const getAirportById = async (req, res) => {
    const airportId = req.params.airport_id;
    try {
        res.status(200).json(await airport.getAirportById(airportId)).send();
    }catch (err) {
        res.status(400).json(err).send();
    }
};

// Create operation
const createAirport = async (req, res) => {
    try {

        if (parseInt(req.body.fuel_available) > parseInt(req.body.fuel_capacity)) {
            return res.status(400).json({
                msg: "Fuel available can not be greater then fuel capacity"
            });
        }
        if (parseInt(req.body.fuel_available) < 0) {
            return res.status(400).json({
                msg: "Fuel available can not be negative"
            });
        }

        if (parseInt(req.body.fuel_capacity) < 0) {
            return res.status(400).json({
                msg: "Fuel available can not be negative"
            });
        }
        if (req.body.airport_id === "" || req.body.airport_id === undefined) {
            return res.status(400).json({
                msg: "Please provide airport id"
            });
        }
        if (req.body.airport_name === "" || req.body.airport_name === undefined) {
            return res.status(400).json({
                msg: "Please provide airport name"
            });
        }


        const airportData = {
            airport_id: req.body.airport_id,
            airport_name: req.body.airport_name,
            fuel_capacity: req.body.fuel_capacity,
            fuel_available: req.body.fuel_available
        };

        res.status(201).json(await airport.createAirport(airportData));

    }catch (err) {
        res.status(400).json(err).send();
    }
};

// Update operation
const updateAirport = async (req, res) => {
    try {

        if (parseInt(req.body.fuel_available) > parseInt(req.body.fuel_capacity)) {
            return res.status(400).json({
                msg: "Fuel available can not be greater then fuel capacity"
            });
        }
        if (parseInt(req.body.fuel_available) < 0) {
            return res.status(400).json({
                msg: "Fuel available can not be negative"
            });
        }

        if (parseInt(req.body.fuel_capacity) < 0) {
            return res.status(400).json({
                msg: "Fuel available can not be negative"
            });
        }
        if (req.body.airport_id === "" || req.body.airport_id === undefined) {
            return res.status(400).json({
                msg: "Please provide airport id"
            });
        }
        if (req.body.airport_name === "" || req.body.airport_name === undefined) {
            return res.status(400).json({
                msg: "Please provide airport name"
            });
        }


        // const airport = new Airport({
        //     fuel_capacity: req.body.fuel_capacity,
        //     fuel_available: req.body.fuel_available
        // })
        await Airport.findOneAndUpdate({ airport_id: req.params.airport_id },
            {
                airport_name: req.body.airport_name,
                fuel_capacity: req.body.fuel_capacity,
                fuel_available: req.body.fuel_available
            }
        );
        res.status(200).json({
            msg: "Airport successfully updated"
        });

    }catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                msg: "Duplicate entry"
            }).send();
        }
        res.status(400).json({
            msg: "Error"
        }).send();
    }
};

// Delete Airport
const deleteAirport = async (req, res) => {
    try {
        await Airport.deleteOne({ airport_id: req.params.airport_id });
        return res.status(204).send();
    }catch (err) {
        res.status(400).json({
            msg: "Error"
        }).send();
    }
};

// Airport report
const getAirportsReport = async (req, res) => {
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
        );
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
        );
        return res.status(200).json(
            {

                airportLTE20: [...resultAirportLTE20.map((data) => {
                    return {
                        airport_id: data.airport_id,
                        airport_name: data.airport_name,
                        fuel_capacity: data.fuel_capacity,
                        fuel_available: data.fuel_available,
                        available_percentage: data.available_percentage,

                    };
                })],
                airportGTE80: [...resultAirportGTE80.map((data) => {
                    return {
                        airport_id: data.airport_id,
                        airport_name: data.airport_name,
                        fuel_capacity: data.fuel_capacity,
                        fuel_available: data.fuel_available,
                        available_percentage: data.available_percentage,

                    };
                })]
            });
    }catch (err) {
        res.status(400).json({
            msg: "Error"
        }).send();
    }
};


module.exports = {
    getAirports,
    createAirport,
    updateAirport,
    deleteAirport,
    getAirportById,
    getTransactionsByAirport,
    getAirportsReport
};
