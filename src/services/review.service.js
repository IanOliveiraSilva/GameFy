const db = require("../config/db");

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

        let { rows: [existingGame] } = await db.query('SELECT * FROM games WHERE gameId = $1', [gameId]);

        if (existingGame && existingGame.gameid) {
            gameId = existingGame.gameid;
        } else {
            const { rows: [newGame] } = await db.query(
                `
                INSERT INTO games (gameid, title, image)
                VALUES ($1, $2, $3) 
                RETURNING *
                `,
                [gameId, title, image]
            );
            gameId = newGame.gameid;
        }

        const { rows: [review] } = await db.query(
            `INSERT INTO reviews (userId, gameId, rating,
                review,
                isPublic)
              VALUES ($1,
                $2,
                $3,
                $4,
                $5)
              RETURNING *`,
            [userId,
                gameId,
                rating,
                comment,
                isPublic,]
        );

        await updateGameAverageRating(gameId);

        return {
            message: 'Review criada com sucesso!',
            body: {
                review
            }
        };
    }

    async getAllReviews({ userId, sort }) {
        const sortOptions = {
            rating_desc: 'r.rating DESC',
            rating_asc: 'r.rating ASC',
            latest: 'created_at DESC',
            oldest: 'created_at ASC',
            title_desc: 'title ASC',
            title_asc: 'title DESC'
        };

        const orderBy = sortOptions[sort] || 'created_at DESC';

        const reviews = await db.query(
            `SELECT r.id, r.userid, r.gameId, g.title, g.gameId, r.rating, r.review, r.ispublic, r.created_at
            FROM reviews r
            JOIN games g ON r.gameId = g.gameid 
            JOIN users ON r.userId = users.id
            WHERE r.userid = ${userId} AND r.isPublic
            GROUP BY r.id, g.title, g.gameId
            
            ORDER BY ${orderBy}
            
            `,
        );

        if (reviews.rows.length === 0) {
            return res.status(400).json({
                message: 'O usuário não possui reviews com os critérios de busca fornecidos.'
            });
        }

        return reviews.rows;
    }

    async getAllReviewsFromGames({ gamesId }) {
        const reviews = await db.query(
            `
            SELECT users.username, reviews.id, games.title, reviews.rating, reviews.review, reviews.created_at, COUNT(c.id) AS comment_count
            FROM reviews 
            INNER JOIN games ON reviews.gameid = games.gameid 
            INNER JOIN users ON reviews.userId = users.id 
            LEFT JOIN comments c ON reviews.id = c.reviewId 
            WHERE games.gameid = $1 AND reviews.ispublic = true
            GROUP BY reviews.id, users.username, games.title
            ORDER BY comment_count DESC
            `,
            [gamesId]
        );

        return reviews.rows;
    }

    async getReviewById({ id }) {
        const review = await db.query(
            `SELECT r.id, r.userid, u.username, up.icon, r.gameid, g.title, g.gameid, r.rating, r.review, r.ispublic, r.created_at 
            FROM reviews r 
            LEFT JOIN games g ON r.gameid = g.gameid
            LEFT JOIN user_profile up ON r.userId = up.userId
            LEFT JOIN users u ON r.userId = u.id
            WHERE r.id = $1 and r.ispublic = true`,
            [id]
        );

        if (!review) {
            return res.status(404).json({
                message: 'Não foi possível encontrar a review com o ID fornecido.'
            });
        }
        return review.rows;
    }

    async deleteReview({ id, userId }) {
        await db.query('DELETE FROM comments WHERE reviewid = $1', [id]);

        const { rows } = await db.query(
            `DELETE FROM reviews
       WHERE userId = $1 AND id = $2
       RETURNING *`,
            [userId, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "A review que você tentou deletar não existe."
            });
        }

        const { rows: [userProfile] } = await db.query(
            'SELECT "contadorreviews" FROM user_profile WHERE userId = $1',
            [userId]
        );

        if (userProfile) {
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

    async getAllReviewsFromUser({ userProfile, sort }) {
        const userIdQuery = await db.query('SELECT userId FROM user_profile WHERE LOWER(userProfile) LIKE $1', [userProfile]);

        if (userIdQuery.rows.length === 0) {
            return res.status(400).json({
                message: 'O usuário não foi encontrado'
            });
        }

        const userId = userIdQuery.rows[0].userid;

        

        const sortOptions = {
            rating_desc: 'r.rating DESC',
            rating_asc: 'r.rating ASC',
            latest: 'created_at DESC',
            oldest: 'created_at ASC',
            title_desc: 'title ASC',
            title_asc: 'title DESC'
        };

        const orderBy = sortOptions[sort] || 'created_at DESC';

        const reviews = await db.query(
            `SELECT r.id, r.userid, r.gameId, g.title, g.gameId, r.rating, r.review, r.ispublic, r.created_at, COUNT(c.id) as comment_count
      FROM reviews r
      JOIN games g ON r.gameId = g.gameid 
      JOIN users ON r.userId = users.id
      LEFT JOIN comments c ON r.id = c.reviewId 
      WHERE r.userid = ${userId} AND r.isPublic
      GROUP BY r.id, users.username, g.title, g.gameid
      ORDER BY ${orderBy}
      `
        );

        if (reviews.rows.length === 0) {
            return res.status(400).json({
                message: 'O usuário não possui reviews'
            });
        }

        return reviews.rows;
    }
}

module.exports = { ReviewService };