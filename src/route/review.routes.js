const router = require('express-promise-router')();
const reviewController = require('../controller/review.controller');
const userController = require('../controller/user.controller');

router.post('/create-review/:id', userController.AuthMiddleware, reviewController.createReview);

router.get('/profile/reviews/', userController.AuthMiddleware, reviewController.getAllReviews);

router.get('/game-reviews/:id', userController.AuthMiddleware, reviewController.getAllReviewsFromGames);

router.get('/user/reviews/:userProfile', userController.AuthMiddleware, reviewController.getAllReviewsFromUser);

router.get('/review/:id', userController.AuthMiddleware, reviewController.getReviewById);

router.delete('/review/:id', userController.AuthMiddleware, reviewController.deleteReview);

module.exports = router;

