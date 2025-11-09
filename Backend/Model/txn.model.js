import mongoose from "mongoose";

const txSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: String,
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    type: { type: String }, // bet|win|loss|cashout|refund
    amount: Number,
    balanceAfter: Number,
    createdAt: { type: Date, default: Date.now }
});
const Tx = mongoose.model("Tx", txSchema);

export default Tx