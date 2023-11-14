require('dotenv').config();

const axios = require("axios");
const db = require("../config/db");

const lowRating = 0;
const highRating = 5;

const updateGameAverageRating = async (gameId) => {
  const { rows: [movie] } = await db.query(
    `SELECT AVG(rating) AS average_rating FROM reviews WHERE gameId = $1`,
    [gameId]
  );
  const averageRating = movie.average_rating || 0;
  await db.query(
    `UPDATE games SET mediaNotas = $1 WHERE id = $2`,
    [averageRating, gameId]
  );
  return averageRating;
};

exports.createReview = async (req, res) => {
  let { gameId, title, rating, comment, isPublic } = req.body;
  const userId = req.user.id;

  try {
    if (!rating || rating < lowRating || rating > highRating) {
      return res.status(400).json({ message: 'Rating deve ser um numero entre 0 a 5' });
    }

    let { rows: [existingGame] } = await db.query('SELECT * FROM games WHERE gameId = $1', [gameId]);

    if (existingGame && existingGame.id) {
      gameId = existingGame.id;
    } else {
      const { rows: [newGame] } = await db.query(
        `
          INSERT INTO games (gameId, title)
          VALUES ($1, $2) 
          RETURNING *
          `,
        [gameId, title]
      );
      gameId = newGame.id;
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

    res.status(201).json({
      message: 'Review criada com sucesso!',
      body: {
        review
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Um erro aconteceu enquanto a review era criada',
      error
    });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const { sort } = req.query;

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
      JOIN games g ON r.gameId = g.id 
      GROUP BY r.id, g.title, g.gameId
      ORDER BY ${orderBy}
      `,
    );

    if (reviews.rows.length === 0) {
      return res.status(400).json({
        message: 'O usuário não possui reviews com os critérios de busca fornecidos.'
      });
    }
    return res.status(200).json(reviews.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
