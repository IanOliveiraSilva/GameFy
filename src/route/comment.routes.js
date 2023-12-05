const router = require("express-promise-router")();
const commentController = require("../controllers/comment.controller");
const { UserMiddleware } = require("../middlewares/auth-middleware");

const userMiddleware = new UserMiddleware();

router.post("/comment", userMiddleware.auth, commentController.createComment);

router.get(
  "/user/comment/:id/",
  userMiddleware.auth,
  commentController.getAllCommentsFromUser
);

router.get(
  "/review/comment/:id",
  userMiddleware.auth,
  commentController.getReviewComments
);

router.delete(
  "/comment/:id",
  userMiddleware.auth,
  commentController.deleteComment
);

router.put(
  "/comment/:id",
  userMiddleware.auth,
  commentController.updateComment
);

module.exports = router;
