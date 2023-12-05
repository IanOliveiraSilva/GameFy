require('dotenv').config();

const { GameService } = require("../services/game.service");

const gameService = new GameService();

exports.getGameById = async (req, res, next) => {
    try {
        const id = req.params.id;

        const response = await gameService.getGameById({ id });
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

exports.getGamesTendency = async (req, res, next) => {
    try {

        const response = await gameService.getGameTendency({});
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};
