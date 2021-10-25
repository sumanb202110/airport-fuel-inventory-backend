const { Router } = require("express")
const transactionRouter = Router()

const { auth } = require("../../middlewares/auth")
const { createTransaction, getTransaction } = require("../controllers/transactionController")

transactionRouter.route("/").get(auth, getTransaction)
transactionRouter.route("/").post(auth, createTransaction)




module.exports = {
    transactionRouter
}