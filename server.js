const express = require("express")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const swaggerUI = require("swagger-ui-express")
const swaggerDocument = require("./swagger.json")
dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    next()
})


app.use(express.json())
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument))

const { airportRouter } = require("./api/routes/airportRoute")
const { aircraftRouter } = require("./api/routes/aircraftRoute")
const { transactionRouter } = require("./api/routes/transactionRoute")
const { userRouter } = require("./api/routes/userRoute")

mongoose.connect(
    process.env.MONGODB_URL
)

app.get('/', (req, res) => {
    res.send("app start")
})

app.use("/api/v1/airports", airportRouter)
app.use("/api/v1/aircrafts", aircraftRouter)
app.use("/api/v1/transactions", transactionRouter)
app.use("/api/v1/users", userRouter)

app.listen(port, () => {
    console.log(`Server starts at http://localhost:${port}`)
})
