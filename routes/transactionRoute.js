const { Router } = require("express")
const transactionRouter = Router()

const { auth } = require("../middlewares/auth")
const { createTransaction, getTransactions, updateTransaction, deleteTransaction, getTransactionById, getTransactionsReport } = require("../controllers/transactionController")

transactionRouter.route("/").get(auth, getTransactions)
transactionRouter.route("/report").get(auth, getTransactionsReport)
transactionRouter.route("/:transaction_id").get(auth, getTransactionById)
transactionRouter.route("/").post(auth, createTransaction)
transactionRouter.route("/:transaction_id").patch(auth, updateTransaction)
transactionRouter.route("/:transaction_id").delete(auth, deleteTransaction)






module.exports = {
    transactionRouter
}