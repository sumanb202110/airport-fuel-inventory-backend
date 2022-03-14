const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const Airport = require("../models/airport");


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
module.exports = {
    getTransactions,
    getTransactionById,
    updateFuelInventory
};