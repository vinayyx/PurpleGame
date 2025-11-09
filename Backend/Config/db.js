import mongoose from "mongoose";
import dotenv from "dotenv";
import e from "cors";

dotenv.config();

const mongo = process.env.MONGO_URL;
const connectDb = async () => {

    try {
        const Db = await mongoose.connect(mongo, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        if (Db) {
            console.log("Your data base has been Connected")
        } else {
            console.log("your data base is not conntected")
        }

    } catch (error) {

        console.log(error)
 }
}

export default connectDb;
