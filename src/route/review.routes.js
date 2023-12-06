const router = require("express-promise-router")();
const reviewController = require("../controllers/review.controller");
const { UserMiddleware } = require("../middlewares/auth-middleware");

const userMiddleware = new UserMiddleware();

router.post(
  "/create-review/:id",
  userMiddleware.auth,
  reviewController.createReview
);

router.get(
  "/profile/reviews/",
  userMiddleware.auth,
  reviewController.getAllReviews
);

router.get(
  "/game-reviews/:id",
  userMiddleware.auth,
  reviewController.getAllReviewsFromGames
);

router.get(
  "/user/reviews/:userProfile",
  userMiddleware.auth,
  reviewController.getAllReviewsFromUser
);

router.get("/review/:id", userMiddleware.auth, reviewController.getReviewById);

router.delete(
  "/review/:id",
  userMiddleware.auth,
  reviewController.deleteReview
);

router.put(
  "/review/:id",
  userMiddleware.auth,
  reviewController.updateReview
);

router.patch(
  "/review/:id",
  userMiddleware.auth,
  reviewController.updateReviewPartially
);


module.exports = router;
