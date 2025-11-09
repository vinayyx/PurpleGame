import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  deviceInfo: { type: String }, 
  ipAddress: { type: String }, 
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

const Token = mongoose.model("Token", tokenSchema);
export default Token;
