const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const transaction = require("../services/transaction.service");

const Airport = require("../models/airport");


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
    try{
        res.status(200).json(
            await transaction.getTransactions(page, count, req.query.airport_ids, req.query.aircraft_ids, req.query.transaction_types, req.query.sort_by));
    }catch (err) {
        res.status(400).json(err).send();
    }
};

// Read operation by id
const getTransactionById = async (req, res) => {
    const transactionId = req.params.transaction_id;
    try {
        const result = await Transaction.findOne({ transaction_id: transactionId });
        return res.status(200).json({
            transaction_id: result.transaction_id,
            transaction_date_time: result.transaction_date_time,
            transaction_type: result.transaction_type,
            airport_id: result.airport_id,
            aircraft_id: result.aircraft_id,
            quantity: result.quantity,
            transaction_id_parent: result.transaction_id_parent
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            msg: "Error"
        }).send();
    }
};

async function updateFuelInventory(req, res) {
    const transaction = new Transaction({
        transaction_id: new mongoose.Types.ObjectId(),
        transaction_type: req.body.transaction_type,
        airport_id: req.body.airport_id,
        aircraft_id: req.body.aircraft_id,
        quantity: req.body.quantity,
        transaction_id_parent: req.body.transaction_id_parent
    });

    const session = await Airport.startSession();
    session.startTransaction();

    try {
        const opts = { session };
        const airportUpdateResult = await Airport.findOneAndUpdate(
            { airport_id: req.body.airport_id },
            { $inc: { fuel_available: req.body.transaction_type === 'OUT' ? -req.body.quantity : req.body.quantity } }, opts);

        // Check fuel available must not be greater then fuel capacity
        if (parseInt(airportUpdateResult.fuel_available) > airportUpdateResult.fuel_capacity) {
            await session.abortTransaction();
            session.endSession();
            return res.status(201).json({
                msg: "Fuel available can not be greater then fuel capacity"
            });
        }

        // Check fuel available must not be negative
        if (parseInt(airportUpdateResult.fuel_available) < 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(201).json({
                msg: "Fuel available can not be negative"
            });
        }
        const transactionCreateResult = await transaction.save(opts);



        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            transaction_id: transactionCreateResult.transaction_id,
            transaction_date_time: transactionCreateResult.transaction_date_time,
            transaction_type: transactionCreateResult.transaction_type,
            airport_id: transactionCreateResult.airport_id,
            aircraft_id: transactionCreateResult.aircraft_id,
            quantity: transactionCreateResult.quantity,
            transaction_id_parent: transactionCreateResult?.transaction_id_parent
        });
    } catch (error) {
        // If an error occurred, abort the whole transaction and
        // undo any changes that might have happened
        await session.abortTransaction();
        session.endSession();
        return res.status(201).json({
            msg: "Error"
        }).send();
    }
}

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


        await updateFuelInventory(req, res);







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

// const checkCondition = async (airportUpdateResult, session, res) => {
//     let msg = "";
//     let condition = false;
//     if (parseInt(airportUpdateResult.fuel_available) > airportUpdateResult.fuel_capacity) {
//         msg = "Fuel available can not be greater then fuel capacity";
//         condition = true;
//     }
//     if (parseInt(airportUpdateResult.fuel_available) < 0) {
//         msg = "Fuel available can not be negative";
//         condition = true;
//     }

//     if (condition) {
//         await session.abortTransaction();
//         session.endSession();

//         return res.status(201).json({
//             msg: msg
//         });
//     }

// };
/*
async function updateFuelInventory(req, res) {
    const session = await Airport.startSession();
    session.startTransaction();

    try {
        const opts = { session };
        const airportUpdateResult = await Airport.findOneAndUpdate(
            { airport_id: req.body.airport_id },
            { $inc: { fuel_available: req.body.transaction_type === "OUT" ? -req.body.quantity : req.body.quantity } }, opts);


        // // Check fuel available must not be greater then fuel capacity
        // if (parseInt(airportUpdateResult.fuel_available) > airportUpdateResult.fuel_capacity) {
        //     await session.abortTransaction();
        //     session.endSession();
        //     // console.log("Fuel available can not be greater then fuel capacity")
        //     return res.status(201).json({
        //         msg: "Fuel available can not be greater then fuel capacity"
        //     })
        // }

        await checkCondition(airportUpdateResult, session, res);

        // // Check fuel available must not be negative
        // if (parseInt(airportUpdateResult.fuel_available) < 0) {
        //     await session.abortTransaction();
        //     session.endSession();
        //     // console.log("Fuel available can not be negative")
        //     return res.status(201).json({
        //         msg: "Fuel available can not be negative"
        //     })
        // }
        await Transaction.findOneAndUpdate({ transaction_id: req.params.transaction_id }, {
            transaction_type: req.body.transaction_type,
            airport_id: req.body.airport_id,
            aircraft_id: req.body.aircraft_id,
            quantity: req.body.quantity,
        }, opts);



        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            msg: "New transaction successfully updated"
        });
    } catch (error) {
        // If an error occurred, abort the whole transaction and
        // undo any changes that might have happened
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
            msg: "Error"
        }).send();
    }
}
*/

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


        await updateFuelInventory(req, res);

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
        await Transaction.deleteOne({ transaction_id: req.params.transaction_id });
        return res.status(204).send();
    } catch (err) {
        res.status(400).json({
            msg: "Error"
        }).send();
    }
};

// Transaction report
const getTransactionsReport = async (req, res) => {

    try {
        const result = await Transaction.aggregate(
            [

                {
                    '$group': {
                        '_id': {
                            'month': {
                                '$month': '$transaction_date_time'
                            },
                            'year': {
                                '$year': '$transaction_date_time'
                            },
                            'transaction_type': '$transaction_type'
                        },
                        'total': {
                            '$sum': '$quantity'
                        }
                    }
                }, {
                    '$project': {
                        '_id': 0,
                        'month': '$_id.month',
                        'year': '$_id.year',
                        'transaction_type': '$_id.transaction_type',
                        'total_quantity': '$total'
                    }
                }, {
                    '$sort': {
                        'year': 1,
                        'month': 1
                    }
                }
            ]
        );

        const todayTransactions = await Transaction.aggregate(
            [{
                '$project': {
                    "year": {
                        "$year": "$transaction_date_time"
                    },
                    "month": {
                        "$month": "$transaction_date_time"
                    },
                    "day": {
                        "$dayOfMonth": "$transaction_date_time"
                    },
                    'transaction_id': 1,
                    'transaction_type': 1,
                    'airport_id': 1,
                    'aircraft_id': 1,
                    'quantity': 1,
                    'transaction_id_parent': 1,
                    'transaction_date_time': 1
                }
            }, {
                '$match': {
                    "year": new Date().getFullYear(),
                    "month": new Date().getMonth() + 1,
                    "day": new Date().getDate()
                }
            }, {
                $project: {
                    'year': 0,
                    'month': 0,
                    'day': 0
                }
            }]
        );

        const mostRecent100Transactions = await Transaction.aggregate(
            [
                {
                    '$sort': {
                        'transaction_date_time': -1
                    }
                }, {
                    '$limit': 100
                }
            ]
        );
        return res.status(200).json(
            {
                yearMonthReport: [...result.map((data) => {
                    return {
                        month: data.month,
                        year: data.year,
                        transaction_type: data.transaction_type,
                        totalQuantity: data.total_quantity
                    };
                })
                ],
                todayTransactions: [
                    ...todayTransactions.map((transaction) => {
                        return {
                            transaction_id: transaction.transaction_id,
                            transaction_date_time: transaction.transaction_date_time,
                            transaction_type: transaction.transaction_type,
                            airport_id: transaction.airport_id,
                            aircraft_id: transaction.aircraft_id,
                            quantity: transaction.quantity,
                            transaction_id_parent: transaction.transaction_id_parent
                        };
                    })
                ],
                mostRecent100Transactions: [
                    ...mostRecent100Transactions.map((transaction) => {
                        return {
                            transaction_id: transaction.transaction_id,
                            transaction_date_time: transaction.transaction_date_time,
                            transaction_type: transaction.transaction_type,
                            airport_id: transaction.airport_id,
                            aircraft_id: transaction.aircraft_id,
                            quantity: transaction.quantity,
                            transaction_id_parent: transaction.transaction_id_parent
                        };
                    })
                ],
                mostRecent10TransactedAirports: [
                    ...mostRecent100Transactions.map((transaction) => {
                        return transaction.airport_id;
                    }).filter((value, index, array) => array.indexOf(value) === index).slice(0, 10)
                ]

            });
    } catch (err) {
        res.status(400).json({
            msg: "Error"
        }).send();
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
