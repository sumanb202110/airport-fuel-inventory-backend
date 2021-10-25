const { Router } = require("express")
const aircraftRouter = Router()

const { auth } = require("../../middlewares/auth")
const { createAircraft, getAircraft } = require("../controllers/aircraftConroler")

aircraftRouter.route("/").get(auth, getAircraft)
aircraftRouter.route("/").post(auth, createAircraft)




module.exports = {
    aircraftRouter
}