const { Router } = require("express")
const airportRouter = Router()

const { auth } = require("../../middlewares/auth")

const { getAirport, createAirport, updateAirport, deleteAirport } = require("../controllers/airportController")

airportRouter.route("/").get(auth, getAirport)
airportRouter.route("/").post(auth, createAirport)
airportRouter.route("/").patch(auth, updateAirport)
airportRouter.route("/:airport_id").delete(auth, deleteAirport)






module.exports = {
    airportRouter
}