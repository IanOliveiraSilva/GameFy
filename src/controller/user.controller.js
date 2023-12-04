require("dotenv").config();

const { UserService } = require("../services/user.service");

const userService = new UserService();

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const response = await userService.signUp({ username, email, password });
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email_or_username, password } = req.body;

    const response = await userService.login({ email_or_username, password });
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { newPassword } = req.body;

    const response = await userService.changePassword({ userId, newPassword });
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

exports.createUserProfile = async (req, res, next) => {
  try {
    const {
      name,
      familyName,
      bio,
      location,
      birthday,
      socialmediaInstagram,
      socialMediaX,
      socialMediaTikTok,
      userProfileTag,
      icon,
    } = req.body;

    const userId = req.user.id;

    const response = await userService.createUserProfile({
      name,
      familyName,
      bio,
      location,
      birthday,
      socialmediaInstagram,
      socialMediaX,
      socialMediaTikTok,
      userProfileTag,
      icon,
      userId,
    });

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    // Requisição do usuario autenticado
    const userId = req.user.id;

    const response = await userService.getUserProfile({ userId });
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

exports.getProfileByUser = async (req, res, next) => {
  try {
    const userProfileParam = req.params.userprofile;

    const response = await userService.getProfileByUser({ userProfileParam });
    return res.status(200).json(response);

  } catch (error) {
    next(error);
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const searchQuery = req.params.user.toLowerCase().trim();

    const response = await userService.searchUsers({ searchQuery });
    return res.status(200).json(response);

  } catch (error) {
    next(error);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    // Requisição do body e do usuario autenticado
    const {
      name,
      familyName,
      bio,
      location,
      birthday,
      socialmediaInstagram,
      socialMediaX,
      socialMediaTikTok,
    } = req.body;
    const userId = req.user.id;

    const response = await userService.updateUserProfile({
      name,
      familyName,
      bio,
      location,
      birthday,
      socialmediaInstagram,
      socialMediaX,
      socialMediaTikTok,
      userId
    });

    return res.status(200).json(response);

  } catch (error) {
    next(error);
  }
};

exports.updateUserProfilePartially = async (req, res, next) => {
  try {
    //Requisição do body e do usuario autenticado
    const {
      name,
      familyName,
      bio,
      location,
      birthday,
      socialmediaInstagram,
      socialMediaX,
      socialMediaTikTok,
      icon,
    } = req.body;
    const userId = req.user.id;

    const response = await userService.updateUserProfilePartially({
      name,
      familyName,
      bio,
      location,
      birthday,
      socialmediaInstagram,
      socialMediaX,
      socialMediaTikTok,
      icon,
      userId
    });

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

exports.AuthMiddleware = async (req, res, next) => {
  try {
    // Verifica se o token está no header
    const token = req.headers.authorization.split(" ")[1];

    await userService.AuthMiddleware({token, req, res, next});

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.GetRatingCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const response = await userService.getRatingCount({ userId });
    return res.status(200).json(response);

  } catch (error) {
    next(error);
  }
};

exports.GetRatingCountByUser = async (req, res, next) => {
  try {
    const userProfile = req.params.userProfile;

    const response = await userService.GetRatingCountByUser({ userProfile });
    return res.status(200).json(response);

  } catch (error) {
    next(error);
  }
};
