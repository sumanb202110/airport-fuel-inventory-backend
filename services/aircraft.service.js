const Aircraft = require("../models/aircraft");

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