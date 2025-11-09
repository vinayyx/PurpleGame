import mongoose from "mongoose";


const gameSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: String,
    betAmount: Number,
    minesCount: Number,
    mines: [Number],        
    revealed: [Number],    
    openedSafeCount: { type: Number, default: 0 },
    status: { type: String, enum: ["playing", "won", "lost", "cashed", "idle"], default: "playing" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});
const mine = mongoose.model("Mine", gameSchema);


export default mine
