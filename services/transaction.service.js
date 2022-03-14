const Transaction = require("../models/transaction");

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
        throw{
            msg: "Error"
        };
    }
};

module.exports = {
    getTransactions
};