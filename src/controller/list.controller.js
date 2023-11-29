require('dotenv').config();

const axios = require("axios");
const db = require("../config/db");
const RAWG_API_KEY = process.env.RAWG_API_KEY;

exports.createList = async (req, res) => {
    const { name, description, gameIds, isPublic } = req.body;
    const userId = req.user.id;

    try {
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

        res.status(201).json({
            message: 'Lista criada com sucesso!',
            body: {
                list
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Um erro aconteceu enquanto a lista era criada',
            error
        });
    }
};

exports.getAllLists = async (req, res) => {
    try {
        const userId = req.user.id;

        const lists = await db.query(
            `SELECT l.id,l.gameIds, l.ispublic, u.username AS user, l.name AS list_name, l.description AS list_description, l.created_at AS Created_At
            FROM lists l
            JOIN users u ON l.userId = u.id
            WHERE u.id = $1
            ORDER BY Created_at DESC;
            `,
            [userId]
        );

        if (lists.rows.length === 0) {
            return res.status(400).json({
                message: 'O usuário não possui listas'
            });
        }

        return res.status(200).json(lists.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getListById = async (req, res) => {
    try {
        const id = req.params.id;

        const lists = await db.query(
            `
            SELECT 
            u.username AS user, 
            l.id,
            l.gameids,
            l.name AS list_name,
            l.description AS list_description, 
            l.created_at AS Created_At,
            l.ispublic,
            COUNT(DISTINCT game) AS games_count
            FROM lists l
            JOIN users u ON l.userId = u.id
            JOIN user_profile up ON u.id = up.userid
            LEFT JOIN 
            unnest(l.gameIds) AS game ON true
            WHERE l.id = $1
            GROUP BY u.username, l.id, l.gameIds ,l.name, l.description, l.created_at;
            `,
            [id]
        );

        if (lists.rows.length === 0) {
            return res.status(404).json({
                message: 'Não foi possível encontrar a lista com o ID fornecido.'
            });
        }

        return res.status(200).json(lists.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Ocorreu um erro ao buscar a lista.',
            error
        });
    }
};

exports.getListByUser = async (req, res) => {
    try {
        const userProfile = req.params.userProfile.toLowerCase();

        const userIdQuery = await db.query('SELECT userId FROM user_profile WHERE LOWER(userProfile) LIKE $1', [userProfile]);

        if (userIdQuery.rows.length === 0) {
            return res.status(400).json({
              message: 'O usuário não foi encontrado'
            });
          }
      
        const userId = userIdQuery.rows[0].userid;
      
        const lists = await db.query(
            `SELECT l.id, l.gameids, u.username AS user, l.name AS list_name, l.description AS list_description, l.created_at AS Created_At
            FROM lists l
            INNER JOIN users u ON l.userid = u.id
            WHERE l.userId = $1 AND l.isPublic = true
            ORDER BY Created_at DESC;
            `,
            [userId]
        );

        if (lists.rows.length === 0) {
            return res.status(404).json({
                message: 'Não foi possível encontrar a lista com o usuario fornecido.'
            });
        }

        return res.status(200).json(lists.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Ocorreu um erro ao buscar a lista.',
            error
        });
    }
};
