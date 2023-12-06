require('dotenv').config();

const { ReviewService } = require("../services/review.service");

const reviewService = new ReviewService();


exports.createReview = async (req, res, next) => {
  try {
    let { gameId, title, rating, comment, isPublic, image } = req.body;
    const userId = req.user.id;

    const response = await reviewService.createReview({ gameId, title, rating, comment, isPublic, image, userId });
    return res.status(200).json(response);

  } catch (error) {
    next(error);
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { sort } = req.query;

    const response = await reviewService.getAllReviews({ userId, sort });
    return res.status(200).json(response);

  } catch (error) {
    next(error);
  }
};

exports.getAllReviewsFromGames = async (req, res, next) => {
  try {
    const gamesId = req.params.id;

    const response = await reviewService.getAllReviewsFromGames({ gamesId });
    return res.status(200).json(response);

  } catch (error) {
    next(error);
  }
};

exports.getReviewById = async (req, res, next) => {
  try {
    const id  = req.params.id;

    const response = await reviewService.getReviewById({ id });
    return res.status(200).json(response);

  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const id  = req.params.id;
    const userId = req.user.id;

    const response = await reviewService.deleteReview({ id, userId });
    return res.status(200).json(response);

  } catch (error) {
    next(error);
  }
};

exports.getAllReviewsFromUser = async (req, res, next) => {
  try {
    const userProfile = req.params.userProfile.toLowerCase();
    const { sort } = req.query;

    const response = await reviewService.getAllReviewsFromUser({ userProfile, sort });
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const  id  = req.params.id;
    const userId = req.user.id;
    const { rating, review } = req.body;
  

    const response = await reviewService.updateReview({ rating, review, id, userId });
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

exports.updateReviewPartially = async (req, res, next) => {
  try {
    const  id  = req.params.id;
    const userId = req.user.id;
    const { rating, review, ispublic } = req.body;

    const response = await reviewService.updateReviewPartially({ rating, review, ispublic, userId, id });
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
