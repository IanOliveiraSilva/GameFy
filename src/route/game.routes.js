const router = require('express-promise-router')();
const gameController = require('../controller/game.controller');
const userController = require('../controller/user.controller')

router.get('/game/:id', gameController.getGameById);

router.get('/games/tendency', gameController.getGamesTendency);


module.exports = router;
