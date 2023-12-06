const db = require("../config/db");

const { ReviewRepository } = require("../repositories/review.repository");

const reviewRepository = new ReviewRepository();

// FUNÇÕES UTILITARIAS
const updateGameAverageRating = async (gameId) => {
    const { rows: [movie] } = await db.query(
        `SELECT AVG(rating) AS average_rating FROM reviews WHERE gameId = $1`,
        [gameId]
    );
    const averageRating = movie.average_rating || 0;
    await db.query(
        `UPDATE games SET mediaNotas = $1 WHERE gameid = $2`,
        [averageRating, gameId]
    );
    return averageRating;
};

class ReviewService {

    async createReview({ gameId, title, rating, comment, isPublic, image, userId }) {
        const lowRating = 0;
        const highRating = 5;

        if (!rating || rating < lowRating || rating > highRating) {
            return res.status(400).json({ message: 'Rating deve ser um numero entre 0 a 5' });
        }

        const review = await reviewRepository.createReview({ gameId, title, rating, comment, isPublic, image, userId });

        await updateGameAverageRating(gameId);

        return {
            message: 'Review criada com sucesso!',
            body: {
                review
            }
        };
    }

    async getAllReviews({ userId, sort }) {
        const reviews = await reviewRepository.getAllReviews({ userId, sort });

        if (reviews.rows.length === 0) {
            return res.status(400).json({
                message: 'O usuário não possui reviews com os critérios de busca fornecidos.'
            });
        }

        return reviews.rows;
    }

    async getAllReviewsFromGames({ gamesId }) {
        const reviews = await reviewRepository.getAllReviewsFromGames({ gamesId });

        return reviews;
    }

    async getReviewById({ id }) {
        const review = await reviewRepository.getReviewById({ id });

        if (!review) {
            return res.status(404).json({
                message: 'Não foi possível encontrar a review com o ID fornecido.'
            });
        }
        return review;
    }

    async getAllReviewsFromUser({ userProfile, sort }) {
        const reviews = await reviewRepository.getAllReviewsFromUser({ userProfile, sort});

        if (reviews.length === 0) {
            return res.status(400).json({
                message: 'O usuário não possui reviews'
            });
        }

        return reviews;
    }

    async deleteReview({ id, userId }) {
        const rows = await reviewRepository.deleteReview({ id, userId});

        if (rows.length === 0) {
            return res.status(404).json({
                message: "A review que você tentou deletar não existe."
            });
        }

        if (rows.userProfile) {
            const currentReviewCount = userProfile.contadorreviews || 0;
            let newReviewCount = currentReviewCount - 1;

            if (newReviewCount < 0) {
                newReviewCount = 0;
            }

            await db.query(
                'UPDATE user_profile SET "contadorreviews" = $1 WHERE userId = $2',
                [newReviewCount, userId]
            );
        }

        return {
            message: "Review deletada com sucesso!",
            review: rows[0]
        };
    }


}

module.exports = { ReviewService };