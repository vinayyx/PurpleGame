// Controllers/auth.controller.js
import bcrypt from "bcryptjs";
import User from "../../Model/user.model.js";
import Token from "../../Model/token.model.js";
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from "../../Utils/jwt.utils.js";
import dotenv from "dotenv";
dotenv.config();

const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "30d";


export const register = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password || !email)
            return res.status(400).json({ success: false, message: "Missing fields" });


        // ✅ Ensure password is string
        const plainPassword = String(password);

        // Get user's IP address 
        const ipAddress =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            "Unknown";

        // check if username exists
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ success: false, message: "Username Allready taken" });

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(plainPassword, salt);

        // create user
        const user = await User.create({
            username,
            email,
            password: hash,
            ipAddress,
            balance: 100 // ADDED 100RS BALANCE TO EVERY USER AT FIRST TIME RESGISTER WE WILL CHANGE IT LATER
        });

        return res.json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, message: "Missing fields" });

        //GETTING USER IP
        const userIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        //ENSURE PASSOWORD IS THE STRING
        const planePassword = String(password)


        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ success: false, error: "invalid credentials" });

        const ok = await bcrypt.compare(planePassword, user.password);
        if (!ok) return res.status(400).json({ success: false, error: "invalid credentials" });

        // create tokens
        const accessToken = signAccessToken({ id: user._id, username: user.username });
        const refreshToken = signRefreshToken({ id: user._id, username: user.username });

        // store refresh token in DB (so we can revoke)
        const expiresAt = new Date(Date.now() + parseExpiryToMs(REFRESH_EXPIRES));
        await Token.create({
            user: user._id,
            token: refreshToken,
            deviceInfo: "web",
            ipAddress: userIP,
            expiresAt
        });

        // send refresh as httpOnly cookie + access token in body
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // set true in production (HTTPS)
            sameSite: "lax",
            maxAge: expiresAt.getTime() - Date.now(),
            path: "/",
        });

        return res.json({ success: true, accessToken, user: { id: user._id, username: user.username, balance: user.balance } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "server error" });
    }
};

export const refresh = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) return res.status(401).json({ success: false, error: "no refresh token" });

        // verify token signature
        const payload = verifyRefreshToken(token);

        // ensure token exists in DB
        const tokenDoc = await Token.findOne({ token });
        if (!tokenDoc) return res.status(401).json({ success: false, error: "refresh token revoked" });

        // optionally check expiry (mongoose doc has expiresAt)
        // issue new access token (and optionally a new refresh token)
        const accessToken = signAccessToken({ id: payload.id, username: payload.username });

        // You can rotate refresh tokens here. For simplicity we keep same refresh token.
        return res.json({ accessToken });
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, error: "invalid refresh token" });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (token) {
            await Token.deleteOne({ token });
            res.clearCookie("refreshToken", { domain: process.env.COOKIE_DOMAIN || undefined, path: "/" });
        }
        return res.json({ success: true, message: "logOut successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "server error" });
    }
};

export const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "server error" });
    }
};

// small helper to parse simple expiry strings like "30d" or "15m"
function parseExpiryToMs(str) {
    if (!str) return 0;
    const num = parseInt(str.slice(0, -1), 10);
    const unit = str.slice(-1);
    switch (unit) {
        case "s": return num * 1000;
        case "m": return num * 60 * 1000;
        case "h": return num * 60 * 60 * 1000;
        case "d": return num * 24 * 60 * 60 * 1000;
        default: return 0;
    }
}
