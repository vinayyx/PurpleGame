
import User from "../../Model/user.model.js";
import Tx from "../../Model/txn.model.js";
import mine from "../../Model/mine.model.js";
import { securePickMines, calcMultiplier } from "../../Helper/mine.helper.js";
const TOTAL_CELLS = 25;




export const startGame = async (req, res) => {
    try {
        const { username, betAmount, minesCount } = req.body;
        if (!username || !betAmount || !minesCount) return res.status(400).json({ error: "missing" });

        // get/create user
        let user = await User.findOne({ username });
        if (!user) user = await User.create({ username, balance: 10000 });

        // check balance
        if (user.balance < betAmount) return res.status(400).json({ error: "Insufficient balance" });

        // deduct bet (lock)
        user.balance -= betAmount;
        await user.save();
        await Tx.create({ user: user._id, username: user.username, type: "bet", amount: -betAmount, balanceAfter: user.balance });

        const mines = securePickMines(Number(minesCount));

        const game = await mine.create({
            user: user._id,
            username: user.username,
            betAmount,
            minesCount,
            mines,
            revealed: [],
            openedSafeCount: 0,
            status: "playing",
            updatedAt: new Date()
        });

        res.json({
            gameId: game._id,
            status: game.status,
            betAmount: game.betAmount,
            minesCount: game.minesCount,
            revealed: game.revealed
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server error" });
    }
}

export const openCell = async (req, res) => {
  try {
    const { gameId, index } = req.body;
    if (!gameId || typeof index !== "number")
      return res.status(400).json({ error: "missing" });

    const game = await mine.findById(gameId);
    if (!game) return res.status(404).json({ error: "game not found" });
    if (game.status !== "playing")
      return res.status(400).json({ error: "game not active" });

    if (game.revealed.includes(index))
      return res.status(400).json({ error: "already revealed" });

    const isMine = game.mines.includes(index);
    game.revealed.push(index);

    let profit = 0;

    if (isMine) {
      // ❌ don't reveal all mines from backend
      game.status = "lost";

      const user = await User.findById(game.user);
      await Tx.create({
        user: user._id,
        username: user.username,
        gameId: game._id,
        type: "loss",
        amount: 0,
        balanceAfter: user.balance,
      });
    } else {
      game.openedSafeCount = (game.openedSafeCount || 0) + 1;

      // ✅ check if all safe tiles opened => win
      const safeTotal = TOTAL_CELLS - game.minesCount;
      if (game.openedSafeCount >= safeTotal) {
        game.status = "won";
        profit = Number(
          (game.betAmount * calcMultiplier(game.openedSafeCount, game.minesCount)).toFixed(2)
        );

        const user = await User.findById(game.user);
        user.balance += profit;
        await user.save();

        await Tx.create({
          user: user._id,
          username: user.username,
          gameId: game._id,
          type: "win",
          amount: profit,
          balanceAfter: user.balance,
        });
      }
    }

    game.updatedAt = new Date();
    await game.save();

    res.json({
      isMine,
      revealed: game.revealed,
      openedSafeCount: game.openedSafeCount,
      status: game.status,
      profit,
      mines: game.mines, // frontend will decide when to show
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
};


export const cashOut = async (req, res) => {
    try {
        const { gameId } = req.body;
        if (!gameId) return res.status(400).json({ error: "missing" });

        const game = await mine.findById(gameId);
        if (!game) return res.status(404).json({ error: "game not found" });
        if (game.status !== "playing") return res.status(400).json({ error: "cannot cashout" });

        // compute profit for current openedSafeCount
        const profit = Number((game.betAmount * calcMultiplier(game.openedSafeCount, game.minesCount)).toFixed(2));

        // mark cashed
        game.status = "cashed";
        game.updatedAt = new Date();
        await game.save();

        // credit user
        const user = await User.findById(game.user);
        user.balance += profit;
        await user.save();
        await Tx.create({ user: user._id, username: user.username, gameId: game._id, type: "cashout", amount: profit, balanceAfter: user.balance });

        res.json({ profit, status: game.status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server error" });
    }
};

export const getGameState = async (req, res) => {
    try {
        const g = await Game.findById(req.params.id);
        if (!g) return res.status(404).json({ error: "not found" });
        res.json(g);
    } catch (err) {
        res.status(500).json({ error: "server error" });
    }
};

export const checkUser = async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "username required" });
    let user = await User.findOne({ username });
    if (!user) user = await User.create({ username, balance: 10000 });
    res.json({ user });
};