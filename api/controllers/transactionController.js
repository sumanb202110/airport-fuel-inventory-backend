const mongoose = require("mongoose")
const Transaction = require("../../models/transaction")
const Airport = require("../../models/airport")



// Read operation
const getTransaction = async (req, res, next) => {
    try {
        const result = await Transaction.find()
        console.log(result)
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
        })]).send()
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

                const transactionCreateResult = await transaction.save(opts);

                await session.commitTransaction();
                session.endSession();
                console.log(transactionCreateResult)

                res.status(201).json({
                    msg: "New transaction successfully created"
                }).send()
            } catch (error) {
                // If an error occurred, abort the whole transaction and
                // undo any changes that might have happened
                await session.abortTransaction();
                session.endSession();
                console.log(error)
            }
        }





    } catch (err) {
        console.log(err)
        if (err.code === 11000) {
            res.status(400).json({
                msg: "Duplicate entry"
            }).send()
        }
        res.status(400).json({
            msg: "Error"
        }).send()
    }

}


module.exports = {
    getTransaction,
    createTransaction
}
