const db = require("../config/db");
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const axios = require("axios");

const { ListRepository } = require("../repositories/list.repository");

const listRepository = new ListRepository();

class ListService {
    async createList({ name, description, gameIds, isPublic, userId }) {
        // Check if the 'name' parameter is provided
        if (!name) {
            throw new Error("Name is required!");
        }

        // Create a list
        const list = await listRepository.createList({ name, description, gameIds, isPublic, userId });

        // Iterate through the 'gameIds' array to get game data from the Rawg API
        for (const id of gameIds) {
            // Make an call to Rawg API to get game data based on the 'id'
            const rawgResponse = await axios.get(`https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`);

            // Check if the API response is successful
            if (rawgResponse.status === 200 && rawgResponse.data && rawgResponse.data.Response === 'True') {
                // Get game data from the Rawg API response
                const gameData = rawgResponse.data;

                // Check if the game with the given 'id' exists in the database
                const game = await listRepository.getMediaNotas({ id });

                // If the game doesn't exist, insert a new game into the database
                if (!game) {
                    const newGame = await listRepository.insertNewGame(gameData.id, gameData.name, gameData.background_image);
                    game = newGame;
                }
            }
        }
        
        // Get user profile 
        const userProfile = await listRepository.getReviewCount({ userId });

        // If the user profile exists, update the count of lists
        if (userProfile) {
            const currentListsCount = userProfile.contadorlists || 0;
            const newListsCount = currentListsCount + 1;

            // Update the count of lists in the user profile
            const updateContadorReviews = await listRepository.updateReviewCount({ newListsCount, userId });
        }

        // Return a success message 
        return {
            message: 'List created successfully!',
            body: {
                list
            }
        };
    }

    async getAllLists({ userId }) {
        // Get all lists
        const lists = await listRepository.getAllLists({ userId });

        // Checking if there are no lists found
        if (!lists) {
            throw new Error("List not found");
        }

        // Return the lists
        return lists.rows;
    }

    async getListById({ id }) {
        // Get list by id
        const lists = await listRepository.getListById({ id });

        // Checking if there are no lists found
        if (!lists) {
            throw new Error("List not found");
        }

        // Return the lists
        return lists.rows;
    }

    async getListByUser({ userProfile }) {
         // Get userId from a especific user
        const userIdQuery = await listRepository.getUserid({ userProfile });

        // Checking if there are no user found
        if (!userIdQuery) {
            throw new Error("User not found");
        }

        // Extract the user ID from the query result
        const userId = userIdQuery.rows[0].userid;

        // Get lists from a especific user
        const lists = await listRepository.getListByUser({ userId });

        // Checking if there are no lists found
        if (!lists) {
            throw new Error("List not found");
        }

        // Return the lists;
        return lists.rows;
    }
}

module.exports = { ListService };