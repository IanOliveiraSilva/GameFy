const router = require('express-promise-router')();
const reviewController = require('../controller/review.controller');
const userController = require('../controller/user.controller');

router.post('/review', userController.AuthMiddleware, reviewController.createReview);

router.get('/allReviews/', userController.AuthMiddleware, reviewController.getAllReviews);

module.exports = router;

