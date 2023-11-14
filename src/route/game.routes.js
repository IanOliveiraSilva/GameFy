const router = require('express-promise-router')();
const gameController = require('../controller/game.controller');

router.get('/game/id', gameController.getGameById);

router.get('/game/')

module.exports = router;
