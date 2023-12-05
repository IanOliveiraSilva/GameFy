const db = require("../config/db");

class ReviewRepository {

    async createReview({ gameId, title, rating, comment, isPublic, image, userId }) {

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

        return review;

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

        return reviews;
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

        return review.rows;
    }

    async getAllReviewsFromUser({ userProfile, sort }) {
        const userIdQuery = await db.query('SELECT userId FROM user_profile WHERE LOWER(userProfile) LIKE $1', [userProfile]);

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

        return reviews.rows;
    }

    async deleteReview({ id, userId }) {
        await db.query('DELETE FROM comments WHERE reviewid = $1', [id]);

        const { rows } = await db.query(
            `DELETE FROM reviews
       WHERE userId = $1 AND id = $2
       RETURNING *`,
            [userId, id]
        );

        const { rows: [userProfile] } = await db.query(
            'SELECT "contadorreviews" FROM user_profile WHERE userId = $1',
            [userId]
        );

        return rows;
    }

}

module.exports = { ReviewRepository };