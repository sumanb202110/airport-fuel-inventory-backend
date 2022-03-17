const { Router } = require("express");
const transactionRouter = Router();
const { body, validationResult } = require('express-validator');


const { auth } = require("../middlewares/auth");
const { createTransaction, getTransactions, updateTransaction, deleteTransaction, getTransactionById, getTransactionsReport }
 = require("../controllers/transactionController");

transactionRouter.route("/").get(auth, getTransactions);
transactionRouter.route("/report").get(auth, getTransactionsReport);
transactionRouter.route("/:transaction_id").get(auth, getTransactionById);
transactionRouter.route("/").post(
    auth,
    // transaction type must be IN/OUT
    body('transaction_type').if((value) => value == "IN" || value == "OUT"),
    // airport id must be a string
    body('airport_id').isString(),
    // aircraft id must be a string
    body('aircraft_id').isString(),
    // quantity must be a number
    body('quantity').isNumeric(),
    // transaction id of parent must be a number
    body('transaction_id_parent').isString(),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error : errors.array()});
        }
        next();
    },
    createTransaction
);
transactionRouter.route("/:transaction_id").patch(
    auth,
    // transaction id must be a string
    body('transaction_id').isString(),
    // transaction type must be IN/OUT
    body('transaction_type').if((value) => value == "IN" || value == "OUT"),
    // airport id must be a string
    body('airport_id').isString(),
    // aircraft id must be a string
    body('aircraft_id').isString(),
    // quantity must be a number
    body('quantity').isNumeric(),
    // transaction id of parent must be a number
    body('transaction_id_parent').isString(),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error : errors.array()});
        }
        next();
    },
    updateTransaction
);
transactionRouter.route("/:transaction_id").delete(auth, deleteTransaction);






module.exports = {
    transactionRouter
};