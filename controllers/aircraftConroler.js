const aircraft = require("../services/aircraft.service");

/**
 * Get aircraft details
 * 
 * @function
 * @param {Object} req 
 * @param {Object} res 
 */
const getAircrafts = async (req, res) => {
    const page = req.query.page || 1;
    const count = req.query.count || 100;
    try {
        res.status(200).json(await aircraft.getAircrafts(page, count));
    } catch (err) {
        res.status(400).json(err).send();
    }
};

/**
 * Get details of specific aircraft
 * 
 * @function
 * @param {Object} req 
 * @param {Object} res 
 */
const getAircraftById = async (req, res) => {
    const aircraftId = req.params.aircraft_id;
    try {
        res.status(200).json(await aircraft.getAircraftById(aircraftId));
    }catch (err) {
        res.status(400).json(err).send();
    }
};

/**
 * Create new aircraft
 * 
 * @function
 * @param {Object} req 
 * @param {Object} res 
 */
const createAircraft = async (req, res) => {
    try {
        const aircraftData = {
            aircraft_id: req.body.aircraft_id,
            aircraft_no: req.body.aircraft_no,
            airline: req.body.airline
        };

        res.status(201).json(await aircraft.createAircraft(aircraftData));

    }catch (err) {
        res.status(400).json(err).send();
    }
};

/**
 * Update details of specific aircraft
 * 
 * @function
 * @param {Object} req 
 * @param {Object} res 
 */
const updateAircraft = async (req, res) => {
    try{
        const aircraftData = {
            aircraft_id: req.body.aircraft_id,
            aircraft_no: req.body.aircraft_no,
            airline: req.body.airline
        };

        res.status(200).json(await aircraft.updateAircraft(aircraftData));

    }catch (err) {
        res.status(400).json(err).send();
    }
};

/**
 * Delete specific aircraft
 * 
 * @function
 * @param {Object} req 
 * @param {Object} res 
 */
const deleteAircraft = async (req, res) => {
    try {
        await aircraft.deleteAircraft(req.params.aircraft_id);
        res.status(204).send();
    }catch (err) {
        res.status(400).json(err);
    }
};


module.exports = {
    getAircrafts,
    createAircraft,
    updateAircraft,
    deleteAircraft,
    getAircraftById
};
