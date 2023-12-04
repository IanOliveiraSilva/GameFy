require("dotenv").config();

const { CommentService } = require("../services/comment.service");

const commentService = new CommentService();

exports.createComment = async (req, res, next) => {
  try {
    const { reviewId, comment } = req.body;
    const userId = req.user.id;

    const response = await commentService.createComment({ reviewId, comment, userId });
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAllCommentsFromUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const response = await commentService.getAllCommentsFromUser({ userId });
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getReviewComments = async (req, res, next) => {
  try {
    const id = req.params.id;

    const response = await commentService.getReviewComment({ id });
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const response = await commentService.deleteComment({ id, userId});
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { comment } = req.body;
    const userId = req.user.id;

    const response = await commentService.updateComment({ id, comment, userId});
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
