const { Router } = require("express")
const airportRouter = Router()

const { auth } = require("../../middlewares/auth")

const { getAirport, createAirport } = require("../controllers/airportController")

airportRouter.route("/").get(auth, getAirport)
airportRouter.route("/").post(auth, createAirport)




module.exports = {
    airportRouter
}