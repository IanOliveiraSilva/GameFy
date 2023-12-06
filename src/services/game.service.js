const axios = require("axios");
const RAWG_API_KEY = process.env.RAWG_API_KEY;

const hltb = require('howlongtobeat');
const hltbService = new hltb.HowLongToBeatService();

const { GameRepository } = require("../repositories/game.repository");

const gameRepository = new GameRepository();

class GameService {
    async getGameById({ id }) {
        // Make a request to the RAWG API
        const rawgResponse = await axios.get(`https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`);

        // Check if the request was successful (status code 200)
        if (rawgResponse.status === 200) {
            // Extract relevant game information from the RAWG API response
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
                tags: game.tags.map(tag => tag.name),
            };

            // Query HowLongToBeat API to get additional gameplay information
            const hltbResult = await hltbService.search(game.name);
            if (hltbResult && hltbResult.length > 0) {
                gameData.gameplayMain = hltbResult[0].gameplayMain;
                gameData.gameplayMainExtra = hltbResult[0].gameplayMainExtra;
                gameData.gameplayCompletionist = hltbResult[0].gameplayCompletionist;
            }

            // Query the game repository to get media ratings
            let medianotas = await gameRepository.getMediaNotas(id);

            // If media ratings are undefined, set a default value
            if (medianotas === undefined) {
                medianotas = {
                    medianotas: 0,
                };
            }

            // Return the extracted game data and media ratings
            return {
                body: {
                    gameData,
                    mediagames: medianotas,
                },
            };
        }
    }

    async getGameTendency({ }) {
        const gamesWithReviewCounts = await gameRepository.getgamesWithReviewCounts();

        return gamesWithReviewCounts;
    }
}

module.exports = { GameService };