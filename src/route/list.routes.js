const router = require('express-promise-router')();
const listController = require('../controller/list.controller');
const userController = require('../controller/user.controller');

router.post('/list/create', userController.AuthMiddleware, listController.createList);

router.get('/profile/lists', userController.AuthMiddleware, listController.getAllLists);

router.get('/list/:id', userController.AuthMiddleware, listController.getListById);

module.exports = router;