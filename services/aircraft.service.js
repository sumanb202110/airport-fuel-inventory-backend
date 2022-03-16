const Aircraft = require("../models/aircraft");

/**
 * Get aircrafts details from database
 * 
 * @function 
 * @param {Number} page 
 * @param {Number} count 
 * @returns 
 */
const getAircrafts = async (page, count) => {
    try {
        const result = await Aircraft.find().skip((parseInt(page) - 1) * parseInt(count)).limit(parseInt(count));
        const resultCount = await Aircraft.find().count();
        return {
            currentPage: page,
            itemsPerPage: result.length,
            totalPages: Math.ceil(resultCount / count),
            totalItems: resultCount,
            data: [...result.map((data) => {
                return {
                    aircraft_id: data.aircraft_id,
                    aircraft_no: data.aircraft_no,
                    airline: data.airline
                };
            })]
        };
    } catch (err) {
        throw{
            msg: "Error"
        };
    }
};

/**
 * Get details of specific aircraft from database
 * 
 * @function
 * @param {string} aircraftId 
 * @returns 
 */
const getAircraftById = async (aircraftId) => {
    try {
        const result = await Aircraft.findOne({ aircraft_id: aircraftId });
        return {
            aircraft_id: result.aircraft_id,
            aircraft_no: result.aircraft_no,
            airline: result.airline
        };
    }catch (err) {
        throw{
            msg: "Error"
        };
    }
};

/**
 * Create new aircraft in database
 * 
 * @function
 * @param {Object} aircraftData 
 * @returns 
 */
const createAircraft = async (aircraftData) => {
    try {
        const aircraft = new Aircraft({
            aircraft_id: aircraftData.aircraft_id,
            aircraft_no: aircraftData.aircraft_no,
            airline: aircraftData.airline
        });
        const createAircraftResult = await aircraft.save();

        return{
            aircraft_id: createAircraftResult.aircraft_id,
            aircraft_no: createAircraftResult.aircraft_no,
            airline: createAircraftResult.airline
        };

    }catch (err) {
        if (err.code === 11000) {
            throw{
                msg: "Duplicate entry"
            };
        }
        throw{
            msg: "Error"
        };
    }
};

/**
 * Update details of specific aircraft
 * 
 * @function
 * @param {Object} aircraftData 
 * @returns 
 */
const updateAircraft = async (aircraftData) => {
    try {
        await Aircraft.findOneAndUpdate({ aircraft_id: aircraftData.aircraft_id }, {
            aircraft_no: aircraftData.aircraft_no,
            airline: aircraftData.airline
        });
        
        return {
            msg: "Aircraft successfully Updated"
        };

    }catch (err) {
        if (err.code === 11000) {
            throw{
                msg: "Duplicate entry"
            };
        }
        throw{
            msg: "Error"
        };
    }
};

/**
 * Delete specific aircraft
 * 
 * @function
 * @param {String} aircraftId 
 * @returns 
 */
const deleteAircraft = async (aircraftId) => {
    try {
        const result = await Aircraft.deleteOne({ aircraft_id: aircraftId});
        if(result.deletedCount == 1){
            return;
        }
        throw{
            msg: `No aircraft with aircraftId ${aircraftId} .`
        };
    }catch (err) {
        throw{
            msg: "Error"
        };
    }
};

module.exports = {
    getAircrafts,
    getAircraftById,
    createAircraft,
    updateAircraft,
    deleteAircraft
};