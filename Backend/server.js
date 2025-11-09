import express from "express"
import cors from "cors"
import crypto from "crypto"

//DB CONNECTION 
import connectDb from "./Config/db.js";
connectDb()

//IMPORT ALL GAME ROUTES
import mine from "./Routes/Game/mine.routes.js"


//IMPORT ALL AUTHROUTES
import auth from "./Routes/Auth/auth.routes.js"

//MIDDLWARES
const app = express();
app.use(cors());
app.use(express.json());


//DEFAULT ROUTE
app.get('/', (req, res) => {
    res.send("Welcome to the Purple")
})

//IMPLIMENT AUTH ROUTES
app.use("/api", auth)

//IMPLIMENT GAME ROUTES
app.use("/api/game/mine", mine)








const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server running on", PORT));
