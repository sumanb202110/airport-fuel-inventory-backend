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


        const airportData = {
            airport_id: req.body.airport_id,
            airport_name: req.body.airport_name,
            fuel_capacity: req.body.fuel_capacity,
            fuel_available: req.body.fuel_available
        };
        
        res.status(200).json(await airport.updateAirport(airportData));
        
    }catch (err) {
        res.status(400).json(err).send();
    }
};

// Delete Airport
const deleteAirport = async (req, res) => {
    try {
        await airport.deleteAirport(req.params.airport_id);
        return res.status(204).send();
    }catch (err) {
        res.status(400).json(err).send();
    }
};

// Airport report
const getAirportsReport = async (req, res) => {
    try {
        res.status(200).json(await airport.getAirportsReport()).send();
    }catch (err) {
        res.status(400).json(err).send();
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
