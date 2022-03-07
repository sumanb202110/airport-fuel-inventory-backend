const { Router } = require("express")
const aircraftRouter = Router()

const { auth } = require("../middlewares/auth")
const { createAircraft, getAircrafts, deleteAircraft, updateAircraft, getAircraftById } = require("../controllers/aircraftConroler")

aircraftRouter.route("/").get(auth, getAircrafts)
aircraftRouter.route("/:aircraft_id").get(auth, getAircraftById)
aircraftRouter.route("/").post(auth, createAircraft)
aircraftRouter.route("/").patch(auth, updateAircraft)
aircraftRouter.route("/:aircraft_id").delete(auth, deleteAircraft)





module.exports = {
    aircraftRouter
}