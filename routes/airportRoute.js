const { Router } = require("express");
const airportRouter = Router();
const { body, validationResult } = require('express-validator');

const { auth } = require("../middlewares/auth");

const { getAirports, createAirport, updateAirport, deleteAirport, getAirportById, getTransactionsByAirport, getAirportsReport }
 = require("../controllers/airportController");

/**
 * This route is to get all airport details.
 */
airportRouter.route("/").get(auth, getAirports);

/**
 * This route is for airport reports.
 */
airportRouter.route("/report").get(auth, getAirportsReport);

/**
 * This airport is for retriving details of any specific airport by
 * providing it's id.
 */
airportRouter.route("/:airport_id").get(auth, getAirportById);

/**
 * This route is used to get all transactions of any specific airport.
 */
airportRouter.route("/:airport_id/transactions").get(auth, getTransactionsByAirport);

/**
 * This route is used to create new airport.
 */
airportRouter.route("/").post(
    auth,
    // airport id must be a string
    body('airport_id').isString(),
    // airport name must be a string
    body('airport_name').isString(),
    // fuel capacity must be a number
    body('fuel_capacity').isNumeric(),
    // fuel available must be a number
    body('fuel_available').isNumeric(),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error : errors.array()});
        }
        next();
    },
    createAirport
);

/**
 * This route is used to update details of any specific airport details.
 */
airportRouter.route("/:airport_id").patch(
    auth,
    // airport id must be a string
    body('airport_id').isString(),
    // airport name must be a string
    body('airport_name').isString(),
    // fuel capacity must be a number
    body('fuel_capacity').isNumeric(),
    // fuel available must be a number
    body('fuel_available').isNumeric(),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error : errors.array()});
        }
        next();
    },
    updateAirport
);

/**
 * This route is used to delete any specific airport by providing it's id.
 */
airportRouter.route("/:airport_id").delete(auth, deleteAirport);






module.exports = {
    airportRouter
};