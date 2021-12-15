const { Router } = require("express")
const airportRouter = Router()

const { auth } = require("../../middlewares/auth")

const { getAirports, createAirport, updateAirport, deleteAirport, getAirportById, getTransactionsByAirport, getAirportsReport } = require("../controllers/airportController")

airportRouter.route("/").get(auth, getAirports)
airportRouter.route("/report").get(auth, getAirportsReport)
airportRouter.route("/:airport_id").get(auth, getAirportById)
airportRouter.route("/:airport_id/transactions").get(auth, getTransactionsByAirport)
airportRouter.route("/").post(auth, createAirport)
airportRouter.route("/:airport_id").patch(auth, updateAirport)
airportRouter.route("/:airport_id").delete(auth, deleteAirport)






module.exports = {
    airportRouter
}