const mongoose = require("mongoose")
const Transaction = require("../../models/transaction")
const Airport = require("../../models/airport")



// Read operation
const getTransaction = async (req, res, next) => {
    const pagination = req.query.pagination
    const page = req.query.page
    const count = req.query.count
    try {
        const resultWithPage = await Transaction.find().skip((parseInt(page)-1) * parseInt(count)).limit(parseInt(count))
        const resultWithoutPage = await Transaction.find()
        const result = pagination === "true" ? resultWithPage : resultWithoutPage 
        return res.status(200).json([...result.map((data) => {
            return {
                transaction_id: data.transaction_id,
                transaction_date_time: data.transaction_date_time,
                transaction_type: data.transaction_type,
                airport_id: data.airport_id,
                aircraft_id: data.aircraft_id,
                quantity: data.quantity,
                transaction_id_parent: data.transaction_id_parent
            }
        })])
    } catch (err) {
        console.log(err)
        res.status(400).json({
            msg: "Error"
        }).send()
    }
}

// Create operation
const createTransaction = async (req, res, next) => {
    try {
        if(req.body.airport_id === "" || req.body.airport_id === undefined){
            return  res.status(400).json({
                msg: "Please provide airport id"
            })
        }

        if(req.body.transaction_type === "" || req.body.transaction_type === undefined){
            return  res.status(400).json({
                msg: "Please provide transaction type"
            })
        }

        if(req.body.transaction_type === "OUT" && (req.body.aircraft_id === undefined || req.body.aircraft_id === "")){
            return  res.status(400).json({
                msg: "Please provide aircraftid in OUT transaction"
            })
        }


        await updateFuelInventory();

        async function updateFuelInventory() {
            const transaction = new Transaction({
                transaction_id: new mongoose.Types.ObjectId(),
                transaction_type: req.body.transaction_type,
                airport_id: req.body.airport_id,
                aircraft_id: req.body.aircraft_id,
                quantity: req.body.quantity,
                transaction_id_parent: req.body.transaction_id_parent
            })

            const session = await Airport.startSession();
            session.startTransaction();

            try {
                const opts = { session };
                const airportUpdateResult = await Airport.findOneAndUpdate(
                    { airport_id: req.body.airport_id },
                    { $inc: { fuel_available: req.body.transaction_type === 'OUT' ? -req.body.quantity : req.body.quantity } }, opts);

                // Check fuel available must not be greater then fuel capacity
                if(parseInt(airportUpdateResult.fuel_available) > airportUpdateResult.fuel_capacity){
                    await session.abortTransaction();
                    session.endSession();
                    console.log("Fuel available can not be greater then fuel capacity")
                    return res.status(201).json({
                        msg: "Fuel available can not be greater then fuel capacity"
                    })
                }

                // Check fuel available must not be negative
                if(parseInt(airportUpdateResult.fuel_available) < 0){
                    await session.abortTransaction();
                    session.endSession();
                    console.log("Fuel available can not be negative")
                    return res.status(201).json({
                        msg: "Fuel available can not be negative"
                    })
                }
                const transactionCreateResult = await transaction.save(opts);
                


                await session.commitTransaction();
                session.endSession();

                res.status(201).json({
                    msg: "New transaction successfully created"
                })
            } catch (error) {
                // If an error occurred, abort the whole transaction and
                // undo any changes that might have happened
                await session.abortTransaction();
                session.endSession();
                console.log(error)
                return res.status(201).json({
                    msg: "Error"
                }).send()
            }
        }





    } catch (err) {
        console.log(err)
        if (err.code === 11000) {
            res.status(400).json({
                msg: "Duplicate entry"
            })
        }
        res.status(400).json({
            msg: "Error"
        })
    }

}


module.exports = {
    getTransaction,
    createTransaction
}
