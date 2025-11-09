import { verifyAccessToken } from "../Utils/jwt.utils.js";



//AUTHENTICATION VERIFY MIDDLEWARE
export const verifyAcess = async (req, res, next) => {

    try {

        const authHeader = req.headers['authorization'] || ""
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        if (!token) return res.status(401).json({ sucess: "false", error: "You are not logged in" });

        const payload = verifyAccessToken(token);
        req.user = { id: payload.id, username: payload.username };
        next();

    } catch (err) {
        return res.status(401).json({ sucess: "false", message: "Invalid or expired token" });

    }
}