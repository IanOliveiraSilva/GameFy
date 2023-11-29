const router = require('express-promise-router')();
const commentController = require('../controller/comment.controller');
const userController = require('../controller/user.controller');

router.post('/comment', userController.AuthMiddleware, commentController.createComment);

router.get('/user/comment/:id/', userController.AuthMiddleware, commentController.getAllCommentsFromUser);

router.get('/review/comment/:id', userController.AuthMiddleware, commentController.getReviewComments);

router.delete('/comment/:id', userController.AuthMiddleware, commentController.deleteComment);

router.put('/comment', userController.AuthMiddleware, commentController.updateComment);

module.exports = router;
