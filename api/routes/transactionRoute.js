const { Router } = require("express")
const transactionRouter = Router()

const { auth } = require("../../middlewares/auth")
const { createTransaction, getTransaction, updateTransaction, deleteTransaction } = require("../controllers/transactionController")

transactionRouter.route("/").get(auth, getTransaction)
transactionRouter.route("/").post(auth, createTransaction)
transactionRouter.route("/").patch(auth, updateTransaction)
transactionRouter.route("/:transaction_id").delete(auth, deleteTransaction)





module.exports = {
    transactionRouter
}