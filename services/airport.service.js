const Airport = require("../models/airport");
const Transaction = require("../models/transaction");

/**
 * Get all airport details
 * 
 * @function
 * @param {Number} page 
 * @param {Number} count 
 * @returns 
 */
const getAirports = async (page, count) => {
    try {
        const result = await Airport.aggregate(
            [
                {
                    '$lookup': {
                        'from': 'airports_transactions',
                        'localField': 'airport_id',
                        'foreignField': '_id',
                        'as': 'airport_transactions'
                    }
                }, {
                    '$unwind': {
                        'path': '$airport_transactions',
                        'preserveNullAndEmptyArrays': true
                    }
                }, {
                    '$project': {
                        '_id': 1,
                        'airport_id': '$airport_id',
                        'airport_name': '$airport_name',
                        'fuel_capacity': '$fuel_capacity',
                        'fuel_available': '$fuel_available',
                        'transactions': '$airport_transactions.transactions'
                    }
                }
            ]
        ).skip((parseInt(page) - 1) * parseInt(count)).limit(parseInt(count));
        const resultCount = await Airport.find().count();
        return {
            currentPage: page,
            itemsPerPage: result.length,
            totalPages: Math.ceil(resultCount / count),
            totalItems: resultCount,
            data: [...result.map((data) => {
                return {
                    airport_id: data.airport_id,
                    airport_name: data.airport_name,
                    fuel_capacity: data.fuel_capacity,
                    fuel_available: data.fuel_available,
                    transactions: data.transactions
                };
            })]
        };
    } catch (err) {
        throw {
            msg: "Error"
        };
    }
};

/**
 * Get all transactions of a specific airport
 * 
 * @function
 * @param {Number} page 
 * @param {Number} count 
 * @param {String} airportId 
 * @returns 
 */
const getTransactionsByAirport = async (page, count, airportId) => {
    try {
        const result = await Transaction.find({ airport_id: airportId })
            .sort({ transaction_date_time: -1 }).skip((parseInt(page) - 1) * parseInt(count)).limit(parseInt(count));
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
 * Get specific airport details
 * 
 * @function
 * @param {String} airportId 
 * @returns 
 */
const getAirportById = async (airportId) => {
    try {
        const result = await Airport.findOne({ airport_id: airportId });
        return {
            airport_id: result.airport_id,
            airport_name: result.airport_name,
            fuel_capacity: result.fuel_capacity,
            fuel_available: result.fuel_available
        };
    } catch (err) {
        throw {
            msg: "Error"
        };
    }
};

/**
 * Create new airport
 * 
 * @function
 * @param {String} airportData 
 * @returns 
 */
const createAirport = async (airportData) => {
    try {
        const airport = new Airport({
            airport_id: airportData.airport_id,
            airport_name: airportData.airport_name,
            fuel_capacity: airportData.fuel_capacity,
            fuel_available: airportData.fuel_available
        });
        const createAirportResult = await airport.save();

        return {
            airport_id: createAirportResult.airport_id,
            airport_name: createAirportResult.airport_name,
            fuel_capacity: createAirportResult.fuel_capacity,
            fuel_available: createAirportResult.fuel_available,
            transactions: createAirportResult.transactions
        };

    } catch (err) {
        if (err.code === 11000) {
            throw {
                msg: "Duplicate entry"
            };
        }
        throw {
            msg: "Error"
        };
    }
};

/**
 * Update specific airport details
 * 
 * @function
 * @param {Object} airportData 
 * @returns 
 */
const updateAirport = async (airportData) => {
    try {
        await Airport.findOneAndUpdate({ airport_id: airportData.airport_id },
            {
                airport_name: airportData.airport_name,
                fuel_capacity: airportData.fuel_capacity,
                fuel_available: airportData.fuel_available
            }
        );
        return {
            msg: "Airport successfully updated"
        };

    } catch (err) {
        if (err.code === 11000) {
            throw {
                msg: "Duplicate entry"
            };
        }
        throw {
            msg: "Error"
        };
    }
};

/**
 * Delete specific airport
 * 
 * @function
 * @param {String} airportId 
 * @returns 
 */
const deleteAirport = async (airportId) => {
    try {
        await Airport.deleteOne({ airport_id: airportId });
        return;
    } catch (err) {
        throw {
            msg: "Error"
        };
    }
};

/**
 * Get airports report
 * 
 * @function
 * @returns 
 */
const getAirportsReport = async () => {
    try {
        const resultAirportLTE20 = await Airport.aggregate(
            [
                {
                    '$project': {
                        'airport_id': 1,
                        'airport_name': 1,
                        'fuel_capacity': 1,
                        'fuel_available': 1,
                        'available_percentage': {
                            '$round': [
                                {
                                    '$multiply': [
                                        {
                                            '$divide': [
                                                '$fuel_available', '$fuel_capacity'
                                            ]
                                        }, 100
                                    ]
                                }, 2
                            ]
                        }
                    }
                }, {
                    '$sort': {
                        'available_percentage': 1
                    }
                }, {
                    '$match': {
                        'available_percentage': {
                            '$lte': 20
                        }
                    }
                }
            ]
        );
        const resultAirportGTE80 = await Airport.aggregate(
            [
                {
                    '$project': {
                        'airport_id': 1,
                        'airport_name': 1,
                        'fuel_capacity': 1,
                        'fuel_available': 1,
                        'available_percentage': {
                            '$round': [
                                {
                                    '$multiply': [
                                        {
                                            '$divide': [
                                                '$fuel_available', '$fuel_capacity'
                                            ]
                                        }, 100
                                    ]
                                }, 2
                            ]
                        }
                    }
                }, {
                    '$sort': {
                        'available_percentage': 1
                    }
                }, {
                    '$match': {
                        'available_percentage': {
                            '$gte': 80
                        }
                    }
                }
            ]
        );
        return {

            airportLTE20: [...resultAirportLTE20.map((data) => {
                return {
                    airport_id: data.airport_id,
                    airport_name: data.airport_name,
                    fuel_capacity: data.fuel_capacity,
                    fuel_available: data.fuel_available,
                    available_percentage: data.available_percentage,

                };
            })],
            airportGTE80: [...resultAirportGTE80.map((data) => {
                return {
                    airport_id: data.airport_id,
                    airport_name: data.airport_name,
                    fuel_capacity: data.fuel_capacity,
                    fuel_available: data.fuel_available,
                    available_percentage: data.available_percentage,

                };
            })]
        };
    } catch (err) {
        throw{
            msg: "Error"
        };
    }
};
module.exports = {
    getAirports,
    getTransactionsByAirport,
    getAirportById,
    createAirport,
    updateAirport,
    deleteAirport,
    getAirportsReport
};