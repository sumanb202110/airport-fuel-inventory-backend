const { Router } = require("express")
const aircraftRouter = Router()

const { auth } = require("../../middlewares/auth")
const { createAircraft, getAircraft, deleteAircraft, updateAircraft } = require("../controllers/aircraftConroler")

aircraftRouter.route("/").get(auth, getAircraft)
aircraftRouter.route("/").post(auth, createAircraft)
aircraftRouter.route("/").patch(auth, updateAircraft)
aircraftRouter.route("/:aircraft_id").delete(auth, deleteAircraft)





module.exports = {
    aircraftRouter
}