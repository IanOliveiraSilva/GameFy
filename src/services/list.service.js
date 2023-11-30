const db = require("../config/db");
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const axios = require("axios");

class ListService {
    async createList({name, description, gameIds, isPublic, userId}){
        if (!name) {
            return res.status(400).json({ message: 'Nome é obrigatório!' });
        }

        const { rows: [list] } = await db.query(
            `INSERT INTO lists 
            (name, 
            description, 
            gameIds, 
            isPublic,
            userId)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *`,
            [name, description, gameIds, isPublic, userId]
        );

        for (const id of gameIds) {
            const rawgResponse = await axios.get(`https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`);
            if (rawgResponse.status === 200 && rawgResponse.data && rawgResponse.data.Response === 'True') {
                const gameData = rawgResponse.data;
                let { rows: [game] } = await db.query('SELECT medianotas FROM games WHERE gameid = $1', [id]);

                if (!game) {
                    const { rows: [newGame] } = await db.query(
                        `INSERT INTO games (gameId, title, image)
                        VALUES ($1, $2, $3)
                        RETURNING id`,
                        [gameData.id, gameData.name, gameData.background_image]
                    );
                    game = newGame;
                }
            }
        }

        // Contador para a review
        const { rows: [userProfile] } = await db.query(
            'SELECT "contadorlists" FROM user_profile WHERE userId = $1',
            [userId]
        );

        if (userProfile) {
            const currentListsCount = userProfile.contadorlists || 0;
            const newListsCount = currentListsCount + 1;

            await db.query(
                'UPDATE user_profile SET "contadorlists" = $1 WHERE userId = $2',
                [newListsCount, userId]
            );
        }

        return{
            message: 'Lista criada com sucesso!',
            body: {
                list
            }
        }
    }
}

module.exports = { ListService };