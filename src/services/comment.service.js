const { CommentRepository } = require("../repositories/comment.repository");

const commentRepository = new CommentRepository();

class CommentService {
    async createComment({ reviewId, comment, userId }) {
        // Get existing review based on the provided reviewId
        const existingReview = await commentRepository.getExistingReview({ reviewId })

        // Checking if there are no review found
        if (!existingReview || !existingReview.id) {
            throw new Error("Review not found!");
        }

        // Check if the user is trying to comment on their own review
        if (existingReview.userid === userId) {
            throw new Error("You can't comment on your own review");
        }

        // Create a new comment
        const newComment = await commentRepository.createComment({ reviewId, comment, userId })

        // Return a success message and the created comment
        return {
            message: 'Comment created successfully!',
            body: {
                comment: newComment
            }
        }
    }

    async getAllCommentsFromUser({ userId }) {
        // Get comments from a especific user
        const comments = await commentRepository.getAllCommentsFromUser({ userId });

        // Checking if there are no comments found
        if (!comments) {
            throw new Error("There are no comments matching the provided user.");
        }

        // Returning the comments
        return comments.rows;
    }

    async getReviewComment({ id }) {
        // Get comment by id
        const comments = await commentRepository.getReviewComment({ id });

        // Checking if there are no comments found
        if (!comments) {
            throw new Error("The review has no comments");
        }

        // Returning the comments
        return comments;
    }

    async deleteComment({ id, userId }) {
        // Deleting the comment
        const comment = await commentRepository.deleteComment({ id, userId })

        // Checking if there are no comments found
        if (!comment) {
            throw new Error("The comment you tried to delete does not exist.");
        }

        // Returning a success message and the deleted comment
        return {
            message: "Comment deleted successfully!",
            comment: comment[0],
        }
    }

    async updateComment({ id, comment, userId }) {
        // Updating the comment
        const Updatecomment = await commentRepository.updateComment({ id, comment, userId })

        // Checking if the user passed the comment
        if (!comment) {
            throw new Error("Comment is mandatory");
        }

        // Checking if there are no comments found
        if (!Updatecomment.length) {
            throw new Error(
                "Unable to find comment with the given ID."
            );
        }

         // Returning a success message and the updated comment
        return {
            message: "CComment updated successfully!",
            comment: Updatecomment[0],
        }
    }
}

module.exports = { CommentService };