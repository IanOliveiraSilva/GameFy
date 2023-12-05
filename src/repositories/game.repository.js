const db = require("../config/db");

class GameRepository {
    async getgamesWithReviewCounts(){
        const { rows: gamesWithReviewCounts } = await db.query(
            `
        SELECT games.gameId, games.image, games.title, COUNT(reviews.id) AS review_count
        FROM games
        LEFT JOIN reviews ON games.gameid = reviews.gameId
        WHERE reviews.ispublic = true OR reviews.ispublic IS NULL
        GROUP BY games.gameid, games.title
        ORDER BY review_count DESC
        LIMIT 4
        `
        );

        return {
            games: gamesWithReviewCounts
        };
    }

    async getMediaNotas(id){
        let { rows: [mediagames] } = await db.query(
            `
          SELECT medianotas
          FROM games 
          WHERE gameId = $1
          `,
            [id]);

        return mediagames
    }
}

module.exports = { GameRepository };