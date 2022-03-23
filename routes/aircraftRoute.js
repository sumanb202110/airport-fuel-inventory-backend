const { Router } = require("express");
const aircraftRouter = Router();
const { body, validationResult } = require('express-validator');

const { auth } = require("../middlewares/auth");
const { createAircraft, getAircrafts, deleteAircraft, updateAircraft, getAircraftById } = require("../controllers/aircraftConroler");

/**
 * This route retrives all aircrafts details.
 */
aircraftRouter.route("/").get(auth, getAircrafts);

/**
 * This route retrives details of any specific aircraft 
 */
aircraftRouter.route("/:aircraft_id").get(auth, getAircraftById);

/**
 * This route creates new aircraft
 */
aircraftRouter.route("/").post(
    auth,
    // aircraft id must be a string
    body('aircraft_id').isString(),
    // aircraft no must be a string
    body('aircraft_no').isString(),
    // airline must be a string
    body('airline').isString(),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error : errors.array()});
        }
        next();
    },
    createAircraft
);

/**
 * This route update details of any specific aircraft
 */
aircraftRouter.route("/").patch(
    auth,
    // aircraft id must be a string
    body('aircraft_id').isString(),
    // aircraft no must be a string
    body('aircraft_no').isString(),
    // airline must be a string
    body('airline').isString(),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error : errors.array()});
        }
        next();
    },
    updateAircraft
);

/**
 * This route delete details of any specific aircraft.
 */
aircraftRouter.route("/:aircraft_id").delete(auth, deleteAircraft);





module.exports = {
    aircraftRouter
};