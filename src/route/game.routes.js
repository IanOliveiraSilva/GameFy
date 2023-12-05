const router = require("express-promise-router")();
const gameController = require("../controllers/game.controller");

router.get("/game/:id", gameController.getGameById);

router.get("/games/tendency", gameController.getGamesTendency);

module.exports = router;
