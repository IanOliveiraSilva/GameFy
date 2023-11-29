require("dotenv").config();

const db = require("../config/db");

exports.createComment = async (req, res, next) => {
  const { reviewId, comment } = req.body;
  const userId = req.user.id;

  try {
    const {
      rows: [existingReview],
    } = await db.query("SELECT * FROM reviews WHERE id = $1", [reviewId]);

    if (!existingReview || !existingReview.id) {
      throw new Error("Review não encontrada!");
    }

    if (existingReview.userid === userId) {
      throw new Error("Você não pode comentar na sua própria review!");
    }

    const {
      rows: [newComment],
    } = await db.query(
      `INSERT INTO comments (reviewId, userId, comment)
        VALUES ($1, $2, $3)
        RETURNING *`,
      [reviewId, userId, comment]
    );

    res.status(201).json({
      message: "Comentário criado com sucesso!",
      body: {
        comment: newComment,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAllCommentsFromUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const comments = await db.query(
      `SELECT c.id, c.reviewid, r.gameId, g.title, c.comment, c.createdAt 
        FROM comments c 
        JOIN reviews r ON c.reviewid = r.id 
        JOIN games g ON r.gameId = g.gameId 
        WHERE c.userId = $1`,
      [userId]
    );

    if (!comments.rows.length) {
      throw new Error("O usuário não possui comentários");
    }

    return res.status(200).json(comments.rows);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getReviewComments = async (req, res, next) => {
  try {
    const id = req.params.id;

    const { rows: comments } = await db.query(
      `SELECT c.id, c.userId, u.username, c.comment, c.createdAt, c.reviewid, COUNT(*)
      FROM comments c 
      JOIN users u ON c.userId = u.id 
      WHERE c.reviewId = $1
      GROUP BY c.id, u.username`,
      [id]
    );

    if (!comments || !comments.length) {
      throw new Error("A review não possui comentários");
    }

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const { rows } = await db.query(
      `DELETE FROM comments
         WHERE userId = $1 AND id = $2
         RETURNING *`,
      [userId, id]
    );

    if (!rows.length) {
      throw new Error("O comentário quer você tentou deletar não exists.");
    }

    return res.status(200).json({
      message: "Comentário deletado com sucesso!",
      comment: rows[0],
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updateComment = async (req, res, next) => {
  const { id } = req.query;
  const userId = req.user.id;
  const { comment } = req.body;

  try {
    if (!comment) {
      throw new Error("Comentário é obrigatório");
    }

    const { rows } = await db.query(
      "UPDATE comments SET comment = $1 WHERE id = $2 AND userId = $3 RETURNING *",
      [comment, id, userId]
    );

    if (!rows.length) {
      throw new Error(
        "Não foi possível encontrar o comentário com o ID fornecido."
      );
    }

    return res.status(200).json({
      message: "Comentário atualizado com sucesso!",
      comment: rows[0],
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
