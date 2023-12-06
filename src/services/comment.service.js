const db = require("../config/db");

const { CommentRepository } = require("../repositories/comment.repository");

const commentRepository = new CommentRepository();

class CommentService {
    async createComment({ reviewId, comment, userId }) {
        const newComment = await commentRepository.createComment({ reviewId, comment, userId })

        return {
            message: 'Comentário criado com sucesso!',
            body: {
                comment: newComment
            }
        }
    }

    async getAllCommentsFromUser({ userId }) {
        const comments = await commentRepository.getAllCommentsFromUser({ userId });

        if (!comments.rows.length) {
            throw new Error("O usuário não possui comentários");
        }

        return comments.rows;
    }

    async getReviewComment({ id }) {
        const comments = await commentRepository.getReviewComment({ id });

        if (!comments || !comments.length) {
            throw new Error("A review não possui comentários");
        }

        return comments;
    }

    async deleteComment({ id, userId }) {
        const rows = await commentRepository.deleteComment({ id, userId })

        if (!rows.length) {
            throw new Error("O comentário quer você tentou deletar não exists.");
        }

        return {
            message: "Comentário deletado com sucesso!",
            comment: rows[0],
        }
    }

    async updateComment({ id, comment, userId }) {
        const rows = await commentRepository.updateComment({ id, comment, userId})
        
        if (!comment) {
            throw new Error("Comentário é obrigatório");
        }

        if (!rows.length) {
            throw new Error(
                "Não foi possível encontrar o comentário com o ID fornecido."
            );
        }

        return {
            message: "Comentário atualizado com sucesso!",
            comment: rows[0],
        }

    }
}

module.exports = { CommentService };