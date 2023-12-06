const db = require("../config/db");

class ListRepository {
    async createList({name, description, gameIds, isPublic, userId}){
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

        return list;
    }

    async insertNewGame(gameId, title, image){
        const { rows: [newGame] } = await db.query(
            `
            INSERT INTO games (gameid, title, image)
            VALUES ($1, $2, $3) 
            RETURNING *
            `,
            [gameId, title, image]
        );

        return newGame;
    }

    async getMediaNotas({id}){
        let { rows: [game] } = await db.query('SELECT medianotas FROM games WHERE gameid = $1', [id]);

        return game;
    }

    async getReviewCount({ userId }){
        const { rows: [userProfile] } = await db.query(
            'SELECT "contadorlists" FROM user_profile WHERE userId = $1',
            [userId]
        );
        
        return userProfile;
    }

    async updateReviewCount({ newListsCount, userId }){
        await db.query(
            'UPDATE user_profile SET "contadorlists" = $1 WHERE userId = $2',
            [newListsCount, userId]
        );
    }

    async getAllLists({ userId }){
        const lists = await db.query(
            `SELECT l.id,l.gameIds, l.ispublic, u.username AS user, l.name AS list_name, l.description AS list_description, l.created_at AS Created_At
            FROM lists l
            JOIN users u ON l.userId = u.id
            WHERE u.id = $1
            ORDER BY Created_at DESC;
            `,
            [userId]
        );

        return lists;
    }

    async getListById({ id }){
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
        
        return lists;
    }

    async getUserid({ userProfile }){
        const userIdQuery = await db.query('SELECT userId FROM user_profile WHERE LOWER(userProfile) LIKE $1', [userProfile]);

        return userIdQuery;
    }

    async getListByUser({ userId }){
        const lists = await db.query(
            `SELECT l.id, l.gameids, u.username AS user, l.name AS list_name, l.description AS list_description, l.created_at AS Created_At
            FROM lists l
            INNER JOIN users u ON l.userid = u.id
            WHERE l.userId = $1 AND l.isPublic = true
            ORDER BY Created_at DESC;
            `,
            [userId]
        );

        return lists;
    }
}

module.exports = { ListRepository };