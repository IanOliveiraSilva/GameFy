const axios = require("axios");
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const db = require("../config/db");

const hltb = require('howlongtobeat');
const hltbService = new hltb.HowLongToBeatService();

class GameService {

    async getGameById({ id }) {
        const rawgResponse = await axios.get(`https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`);
        if (rawgResponse.status === 200) {
            const game = rawgResponse.data;
            const gameData = {
                name: game.name,
                released: game.released,
                rating: game.rating,
                genres: game.genres.map(genre => genre.name),
                description: game.description,
                image: game.background_image,
                platforms: game.platforms.map(platform => platform.platform.name),
                website: game.website,
                gameId: game.id,
                developers: game.developers.map(dev => dev.name),
                publishers: game.publishers.map(pub => pub.name),
                tags: game.tags.map(tag => tag.name)
            };

            const hltbResult = await hltbService.search(game.name);
            if (hltbResult && hltbResult.length > 0) {
                gameData.gameplayMain = hltbResult[0].gameplayMain;
                gameData.gameplayMainExtra = hltbResult[0].gameplayMainExtra;
                gameData.gameplayCompletionist = hltbResult[0].gameplayCompletionist;
            }

            let { rows: [mediagames] } = await db.query(
                `
              SELECT medianotas
              FROM games 
              WHERE gameId = $1
              `,
                [id]);

            if (!mediagames) {
                mediagames = {
                    medianotas: 0,
                };
            }
            return {
                body: {
                    gameData,
                    mediagames
                }
            };
        }
    }

    async getGameTendency({ }) {
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
        }
    }
}

module.exports = { GameService };