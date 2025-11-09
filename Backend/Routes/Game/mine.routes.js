import express from 'express'
import { cashOut, checkUser, getGameState, openCell, startGame } from '../../Controller/Game/mine.controller.js'
const router = express.Router()


router.post("/start", startGame)
router.post("/openCell", openCell)
router.post("/cashOut", cashOut)
router.get("/gameState", getGameState)
router.post("/checkUser", checkUser)

export default router