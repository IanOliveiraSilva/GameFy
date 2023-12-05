require('dotenv').config();

const { ListService } = require("../services/list.service");

const listService = new ListService();

exports.createList = async (req, res, next) => {
    try {
        const { name, description, gameIds, isPublic } = req.body;
        const userId = req.user.id;

        const response = await listService.createList({ name, description, gameIds, isPublic, userId });
        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
};

exports.getAllLists = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const response = await listService.getAllLists({ userId });
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

exports.getListById = async (req, res, next) => {
    try {
        const id = req.params.id;

        const response = await listService.getListById({ id });
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

exports.getListByUser = async (req, res, next) => {
    try {
        const userProfile = req.params.userProfile.toLowerCase();

        const response = await listService.getListByUser({ userProfile });
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};
