const db = require("../config/db");

const { ReviewRepository } = require("../repositories/review.repository");

const reviewRepository = new ReviewRepository();

// FUNÇÕES UTILITARIAS
const updateGameAverageRating = async (gameId) => {
    // Get the average rating of reviews for the specified game
    const { rows: [result] } = await db.query(
        `SELECT AVG(rating) AS average_rating FROM reviews WHERE gameId = $1`,
        [gameId]
    );

    // Get the average rating from the result or defaulting to 0 if undefined
    const averageRating = result.average_rating || 0;

    // Updating the mediaNotas in the games table
    await db.query(
        `UPDATE games SET mediaNotas = $1 WHERE gameid = $2`,
        [averageRating, gameId]
    );

    // Returning the average rating
    return averageRating;
};

class ReviewService {
    async createReview({ gameId, title, rating, comment, isPublic, image, userId }) {
        // Defining limits for ratings
        const lowRating = 0;
        const highRating = 5;

        // Checking if a game with the provided ID already exists
        const existingGame = await reviewRepository.findGame({ gameId });

        // If the game exists, use the existing ID. Otherwise, insert a new game and use the new ID
        gameId = existingGame && existingGame.gameid
            ? existingGame.gameid
            : (await reviewRepository.insertNewGame({ gameId, title, image })).gameid;

        // Checking if the rating is within the allowed limits
        if (!rating || rating < lowRating || rating > highRating) {
            throw new Error('Rating must be a number between 0 and 5');
        }

        // Creating the review
        const review = await reviewRepository.createReview({ gameId, title, rating, comment, isPublic, image, userId });

        // Updating the game's average rating
        await updateGameAverageRating(gameId);

        // Returning a success message with the details of the created review
        return {
            message: 'Review created successfully!',
            body: {
                review
            }
        };
    }

    async getAllReviews({ userId, sort }) {
        // Get all reviews
        const reviews = await reviewRepository.getAllReviews({ userId, sort });

        // Checking if there are no reviews found
        if (reviews.rows.length === 0) {
            throw new Error('The user has no reviews matching the provided search criteria.');
        }

        // Returning the reviews
        return reviews.rows;
    }

    async getAllReviewsFromGames({ gamesId }) {
        // Get reviews from a especific game
        const reviews = await reviewRepository.getAllReviewsFromGames({ gamesId });

        // Checking if there are no reviews found
        if (!reviews) {
            throw new Error('The user has no reviews matching the provided game ID.');
        }

        // Returning the reviews
        return reviews;
    }

    async getReviewById({ id }) {
        // Get reviews by id
        const review = await reviewRepository.getReviewById({ id });

        // Checking if there are no reviews found
        if (!review) {
            throw new Error('There are no reviews matching if the provided ID.');
        }

        // Returning the reviews
        return review;
    }

    async getAllReviewsFromUser({ userProfile, sort }) {
        // Get reviews from a especific user
        const reviews = await reviewRepository.getAllReviewsFromUser({ userProfile, sort });

        // Checking if there are no reviews found
        if (!reviews) {
            throw new Error('There are no reviews matching the provided user.');
        }

        // Returning the reviews
        return reviews;
    }

    async deleteReview({ id, userId }) {
        // Deleting the review
        const reviews = await reviewRepository.deleteReview({ id, userId });

        // Checking if there are no reviews found
        if (!reviews) {
            throw new Error('The user has no reviews matching the provided ID.');
        }

        // Get the user review count
        const userProfile = await reviewRepository.getContadorReviews({ userId });

        // Updating the user review count if the user profile is available
        if (userProfile) {
            // Retrieving the current review count or defaulting to 0 if undefined
            const currentReviewCount = userProfile.contadorreviews || 0;

            // Calculating the new review count after the deletion
            let newReviewCount = currentReviewCount - 1;

            // Ensuring the review count does not go below 0
            if (newReviewCount < 0) {
                newReviewCount = 0;
            }

            // Updating the user review count
            const updateContadorReviews = await reviewRepository.updateContadorReviews({ newReviewCount, userId });
        }

        // Returning a success message and the deleted review
        return {
            message: "Review successfully deleted!",
            review: reviews[0]
        };
    }

    async updateReview({ rating, review, id, userId }) {
        // Check if the 'rating' parameter is provided
        if (!rating) {
            return res.status(400).json({
                message: 'Rating is required'
            });
        }

        // Check if the 'review' parameter is provided
        if (!review) {
            return res.status(400).json({
                message: 'Review is required'
            });
        }

        // Update the review
        const updateReview = await reviewRepository.updateReview({ rating, review, id, userId });

        // Check if there are no reviews found
        if (!updateReview) {
            throw new Error('The user has no reviews matching the provided id.');
        }

        // Return a success message
        return {
            message: "Review updated successfully!",
            review: updateReview[0]
        };
    }

    async updateReviewPartially({ rating, review, ispublic, userId, id }) {
        // Get the existing review 
        const existingReview = await reviewRepository.getExistingReview({ id, userId });

        // Check if there is no existing review
        if (!existingReview) {
            throw new Error('The user has no reviews matching the provided id.');
        }

        // Create an updatedReview object with the provided parameters, or use existing values if not provided
        const updatedReview = {
            rating: rating || existingReview.rating,
            review: review || existingReview.review,
            ispublic: ispublic !== undefined ? ispublic : existingReview.ispublic
        };

        // Update the review
        const newReview = await reviewRepository.updateReviewPartially(updatedReview, userId, id);

        // Return a success message
        return {
            message: "Review updated successfully!",
            review: newReview
        };
    }
}

module.exports = { ReviewService };