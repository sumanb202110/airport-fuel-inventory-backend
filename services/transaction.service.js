const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const Airport = require("../models/airport");

/**
 * Get all transaction details
 * 
 * @function
 * @param {Number} page 
 * @param {Number} count 
 * @param {String} airportIds 
 * @param {String} aircraftIds 
 * @param {String} transactionTypes 
 * @param {String} sortBy 
 * @returns 
 */
const getTransactions = async (page, count, airportIds, aircraftIds, transactionTypes, sortBy) => {
    let aggregateArr = [
        {
            '$set': {
                'quantity': {
                    '$convert': {
                        'input': '$quantity',
                        'to': 'int'
                    }
                }
            }
        }
    ];

    if (airportIds !== undefined) {
        aggregateArr.push(
            {
                "$match": {
                    "$or": airportIds?.split(",").map((data) => { return { airport_id: data }; })
                }
            }
        );
    }

    if (aircraftIds !== undefined) {
        aggregateArr.push(
            {
                "$match": {
                    "$or": aircraftIds?.split(",").map((data) => { return { aircraft_id: data }; })
                }
            }
        );
    }

    if (transactionTypes !== undefined) {
        aggregateArr.push(
            {
                "$match": {
                    "$or": transactionTypes?.split(",").map((data) => { return { transaction_type: data }; })
                }
            }
        );
    }



    if (sortBy === "DATE_HIGH_LOW") {
        aggregateArr.push({
            "$sort": {
                "transaction_date_time": -1
            }
        });
    } else if (sortBy === "DATE_LOW_HIGH") {
        aggregateArr.push({
            "$sort": {
                "transaction_date_time": 1
            }
        });
    } else if (sortBy === "QUANTITY_LOW_HIGH") {
        aggregateArr.push({
            "$sort": {
                "quantity": 1
            }
        });
    } else if (sortBy === "QUANTITY_HIGH_LOW") {
        aggregateArr.push({
            "$sort": {
                "quantity": -1
            }
        });
    } else {
        aggregateArr.push({
            "$sort": {
                "transaction_date_time": -1
            }
        });
    }
    try {
        const result = await Transaction.aggregate(
            aggregateArr
        ).skip((parseInt(page) - 1) * parseInt(count)).limit(parseInt(count));
        const resultCount = await Transaction.find().count();
        return {
            currentPage: page,
            itemsPerPage: result.length,
            totalPages: Math.ceil(resultCount / count),
            totalItems: resultCount,
            data: [...result.map((data) => {
                return {
                    transaction_id: data.transaction_id,
                    transaction_date_time: data.transaction_date_time,
                    transaction_type: data.transaction_type,
                    airport_id: data.airport_id,
                    aircraft_id: data.aircraft_id,
                    quantity: data.quantity,
                    transaction_id_parent: data.transaction_id_parent
                };
            })
            ]
        };
    } catch (err) {
        throw {
            msg: "Error"
        };
    }
};

/**
 * Get details of specific transaction
 * 
 * @function
 * @param {String} transactionId 
 * @returns 
 */
const getTransactionById = async (transactionId) => {
    try {
        const result = await Transaction.findOne({ transaction_id: transactionId });
        return {
            transaction_id: result.transaction_id,
            transaction_date_time: result.transaction_date_time,
            transaction_type: result.transaction_type,
            airport_id: result.airport_id,
            aircraft_id: result.aircraft_id,
            quantity: result.quantity,
            transaction_id_parent: result.transaction_id_parent
        };
    } catch (err) {
        throw {
            msg: "Error"
        };
    }
};

/**
 * Update transaction and airport details 
 * 
 * @function
 * @param {Object} transactionData 
 * @returns 
 */
const updateFuelInventory = async (transactionData) => {
    const transaction = {
        transaction_type: transactionData.transaction_type,
        airport_id: transactionData.airport_id,
        aircraft_id: transactionData.aircraft_id,
        quantity: transactionData.quantity,
        transaction_id_parent: transactionData.transaction_id_parent
    };

    const session = await Airport.startSession();
    session.startTransaction();

    try {
        const opts = { session };
        const airportUpdateResult = await Airport.findOneAndUpdate(
            { airport_id: transactionData.airport_id },
            { $inc: { fuel_available: transactionData.transaction_type === 'OUT' ? -transactionData.quantity : transactionData.quantity } }, opts);

        // Check fuel available must not be greater then fuel capacity
        if (parseInt(airportUpdateResult.fuel_available) > airportUpdateResult.fuel_capacity) {
            await session.abortTransaction();
            session.endSession();
            throw {
                msg: "Fuel available can not be greater then fuel capacity"
            };
        }

        // Check fuel available must not be negative
        if (parseInt(airportUpdateResult.fuel_available) < 0) {
            await session.abortTransaction();
            session.endSession();
            throw {
                msg: "Fuel available can not be negative"
            };
        }
        let transactionCreateResult = await Transaction.findOneAndUpdate(
            { transaction_id: new mongoose.Types.ObjectId(transactionData.transaction_id) },
            transaction,
            {
                session: opts.session,
                upsert: true,
                new: true
            }
        );




        await session.commitTransaction();
        session.endSession();

        return {
            transaction_id: transactionCreateResult.transaction_id,
            transaction_date_time: transactionCreateResult.transaction_date_time,
            transaction_type: transactionCreateResult.transaction_type,
            airport_id: transactionCreateResult.airport_id,
            aircraft_id: transactionCreateResult.aircraft_id,
            quantity: transactionCreateResult.quantity,
            transaction_id_parent: transactionCreateResult?.transaction_id_parent
        };
    } catch (error) {
        // If an error occurred, abort the whole transaction and
        // undo any changes that might have happened
        await session.abortTransaction();
        session.endSession();
        throw {
            msg: "Error"
        };
    }
};

/**
 * Delete specific transaction
 * 
 * @function
 * @param {String} transactionId 
 */
const deleteTransaction = async (transactionId) => {
    try {
        await Transaction.deleteOne({ transaction_id: transactionId });
    } catch (err) {
        throw {
            msg: "Error"
        };
    }
};

/**
 * Get transactions report
 * 
 * @function
 * @returns 
 */
const getTransactionsReport = async () => {

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
        return {
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

        };
    } catch (err) {
        throw{
            msg: "Error"
        };
    }
};

module.exports = {
    getTransactions,
    getTransactionById,
    updateFuelInventory,
    deleteTransaction,
    getTransactionsReport
};