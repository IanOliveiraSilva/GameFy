require('dotenv').config();

const axios = require("axios");
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const db = require("../config/db");


const hltb = require('howlongtobeat');
const hltbService = new hltb.HowLongToBeatService();

exports.getGameById = async (req, res) => {
    const id = req.params.id;

    try {
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

            res.status(200).json({
                body: {
                    gameData,
                    mediagames
                }
            });
        } else {
            return res.status(404).json({ message: 'Jogo não encontrado' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao pesquisar jogo' });
    }
};


exports.getGamesTendency = async (req, res) => {
    try {
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

        res.status(200).json({
            games: gamesWithReviewCounts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar a solicitação.' });
    }
};

exports.playedGame = async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;

    try {
        const result = await db.query('SELECT played FROM user_game WHERE gameid = $1', [id]);
        const currentPlayedValue = result.rows[0].played;

        const newPlayedValue = !currentPlayedValue;
        await db.query('UPDATE user_game SET played = $1 WHERE gameid = $2 and userId = $3', [newPlayedValue, id, userId]);

        res.status(200).json({ message: 'Status do jogo atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar o status do jogo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

