const transaction = require("../services/transaction.service");

/**
 * This function is used to get transactions details from the database
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getTransactions = async (req, res) => {
    const page = req.query.page || 1;
    const count = req.query.count || 100;
    try {
        res.status(200).json(
            await transaction.getTransactions(page, count, req.query.airport_ids, req.query.aircraft_ids, req.query.transaction_types, req.query.sort_by));
    } catch (err) {
        res.status(400).json(err).send();
    }
};

// Read operation by id
const getTransactionById = async (req, res) => {
    const transactionId = req.params.transaction_id;
    try {
        res.status(200).json(
            await transaction.getTransactionById(transactionId)
        );
    } catch (err) {
        res.status(400).json(err).send();
    }
};
// Create operation
const createTransaction = async (req, res) => {
    try {
        if (req.body.airport_id === "" || req.body.airport_id === undefined) {
            return res.status(400).json({
                msg: "Please provide airport id"
            });
        }

        if (req.body.transaction_type === "" || req.body.transaction_type === undefined) {
            return res.status(400).json({
                msg: "Please provide transaction type"
            });
        }

        if (req.body.transaction_type === "OUT" && (req.body.aircraft_id === undefined || req.body.aircraft_id === "")) {
            return res.status(400).json({
                msg: "Please provide aircraftid in OUT transaction"
            });
        }
        const transactionData = {
            transaction_type: req.body.transaction_type,
            airport_id: req.body.airport_id,
            aircraft_id: req.body.aircraft_id,
            quantity: req.body.quantity,
            transaction_id_parent: req.body.transaction_id_parent
        };

        try {
            res.status(201).json(
                await transaction.updateFuelInventory(transactionData)
            );
        } catch (err) {
            res.status(400).json(err).send();
        }

    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({
                msg: "Duplicate entry"
            });
        }
        res.status(400).json({
            msg: "Error"
        });
    }

};

// Update operation
const updateTransaction = async (req, res) => {
    try {
        if (req.body.airport_id === "" || req.body.airport_id === undefined) {
            return res.status(400).json({
                msg: "Please provide airport id"
            });
        }

        if (req.body.transaction_type === "" || req.body.transaction_type === undefined) {
            return res.status(400).json({
                msg: "Please provide transaction type"
            });
        }

        if (req.body.transaction_type === "OUT" && (req.body.aircraft_id === undefined || req.body.aircraft_id === "")) {
            return res.status(400).json({
                msg: "Please provide aircraftid in OUT transaction"
            });
        }

        const transactionData = {
            transaction_id: req.body.transaction_id,
            transaction_type: req.body.transaction_type,
            airport_id: req.body.airport_id,
            aircraft_id: req.body.aircraft_id,
            quantity: req.body.quantity,
            transaction_id_parent: req.body.transaction_id_parent
        };

        try {
            res.status(200).json(
                await transaction.updateFuelInventory(transactionData)
            );
        } catch (err) {
            res.status(400).json(err).send();
        }


    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({
                msg: "Duplicate entry"
            });
        }
        res.status(400).json({
            msg: "Error"
        });
    }
};

// Delete operation
const deleteTransaction = async (req, res) => {
    try {
        await transaction.deleteTransaction(req.params.transaction_id );
        res.status(204).send();
    } catch (err) {
        res.status(400).json(err).send();
    }
};

// Transaction report
const getTransactionsReport = async (req, res) => {
    try{
        res.status(200).json(await transaction.getTransactionsReport());
    }catch(err){
        res.status(400).json(err).send();
    }
};

module.exports = {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getTransactionsReport
};
