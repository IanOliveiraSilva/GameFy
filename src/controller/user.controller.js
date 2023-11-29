require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { UserService } = require("../services/user.service");

function formatarDataParaString(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      `
      UPDATE users
      SET password = $1 
      WHERE id = $2
      `,
      [hashedPassword, userId]
    );
    return res.status(201).json({ user: "Senha alterada com sucesso!" });
  } catch (error) {
    next(error);
  }
};

exports.createUserProfile = async (req, res, next) => {
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
      userProfileTag,
      icon,
    } = req.body;

    const userId = req.user.id;

    const {
      rows: [userProfile],
    } = await db.query(
      `INSERT INTO user_profile(name, familyName, bio, userId, location, birthday, socialmediaInstagram, socialMediaX, socialMediaTikTok, userProfile, icon) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
      [
        name,
        familyName,
        bio,
        userId,
        location,
        birthday,
        socialmediaInstagram,
        socialMediaX,
        socialMediaTikTok,
        userProfileTag,
        icon,
      ]
    );
    res.status(201).json({
      message: "Perfil criado com sucesso",
      body: {
        profile: userProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    // Requisição do usuario autenticado
    const userId = req.user.id;

    let {
      rows: [userProfile],
    } = await db.query(
      `SELECT u.id, u.userid, u.name as givenName, u.familyname, u.location, u.bio, u.birthday, u.socialmediainstagram, u.socialmediax, u.socialmediatiktok, u.userprofile, u.icon,
      (SELECT COUNT(*) FROM reviews WHERE userId = $1) AS contadorreviews, 
      (SELECT COUNT(*) FROM lists WHERE userId = $1) AS contadorlists 
      FROM user_profile u
      WHERE u.userId = $1
      `,
      [userId]
    );

    if (userProfile == undefined) {
      userProfile = {
        haveProfile: false,
      };
    }

    // Formata a data de nascimento para o formato 'DD/MM/AAAA'
    if (userProfile && userProfile.birthday) {
      const dataFormatada = formatarDataParaString(
        new Date(userProfile.birthday)
      );
      userProfile.birthday = dataFormatada;
    }

    res.status(200).json({
      message: "Perfil encontrado com sucesso!",
      body: {
        profile: userProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfileByUser = async (req, res, next) => {
  try {
    const userProfileParam = req.params.userprofile;

    // Consulta o userId baseado no userProfile
    const userIdQuery = await db.query(
      "SELECT * FROM user_profile WHERE LOWER(userProfile) = LOWER($1)",
      [userProfileParam]
    );

    if (!userIdQuery.rows.length) {
      throw new Error("O usuário não foi encontrado");
    }

    const userId = userIdQuery.rows[0].userid;

    // Consulta o perfil do usuário
    const {
      rows: [userProfile],
    } = await db.query(
      `SELECT u.id, u.userid, u.name as givenName, u.familyname, u.bio, u.location, u.birthday, u.socialmediainstagram, u.socialmediax, u.socialmediatiktok, u.userprofile, 
      u.icon, 
      (SELECT COUNT(*) FROM reviews WHERE userId = $1) AS contadorreviews, 
      (SELECT COUNT(*) FROM lists WHERE userId = $1) AS contadorlists 
      FROM user_profile u
      WHERE u.userId = $1`,
      [userId]
    );

    // Formata a data de nascimento para o formato 'DD/MM/AAAA'
    if (userProfile && userProfile.birthday) {
      const dataFormatada = formatarDataParaString(
        new Date(userProfile.birthday)
      );
      userProfile.birthday = dataFormatada;
    }

    res.status(200).json({
      message: "Perfil encontrado com sucesso!",
      body: {
        profile: userProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const searchQuery = req.params.user.toLowerCase().trim();

    const { rows: users } = await db.query(
      "SELECT * FROM user_profile WHERE LOWER(userProfile) LIKE $1",
      [`%${searchQuery}%`]
    );

    if (!users.length) {
      throw new Error("Nenhum usuário encontrado com a consulta fornecida");
    }

    const profiles = users.map((user) => {
      return {
        userId: user.userid,
        givenName: user.name,
        familyName: user.familyname,
        userProfile: user.userprofile,
        icon:
          user.icon ||
          "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.webp",
      };
    });

    res.status(200).json({
      message: "Usuários encontrados com sucesso!",
      body: {
        users: profiles,
      },
    });
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

    // Atualiza o perfil do usuário no banco de dados
    const {
      rows: [newProfile],
    } = await db.query(
      `UPDATE user_profile
       SET name = $1,
        familyName = $2,
        bio = $3,
        location = $4,
        birthday = $5,
        socialmediaInstagram = $6, 
        socialMediaX = $7,
        socialMediaTikTok = $8
       WHERE userId = $9
       RETURNING *`,
      [
        name,
        familyName,
        bio,
        location,
        birthday,
        socialmediaInstagram,
        socialMediaX,
        socialMediaTikTok,
        userId,
      ]
    );

    return res.status(200).json({
      message: "Perfil atualizado com sucesso",
      profile: newProfile,
    });
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

    // Consulta o perfil existente do usuário
    const existingProfile = await db.query(
      "SELECT * FROM user_profile WHERE userId = $1",
      [userId]
    );

    // Atualiza apenas os campos fornecidos no corpo da requisição, mantendo os valores existentes se não forem fornecidos
    const updatedProfile = {
      name: name || existingProfile.rows[0].name,
      familyName: familyName || existingProfile.rows[0].familyname,
      bio: bio || existingProfile.rows[0].bio,
      location: location || existingProfile.rows[0].location,
      birthday: birthday || existingProfile.rows[0].birthday,
      socialmediaInstagram:
        socialmediaInstagram || existingProfile.rows[0].socialmediaInstagram,
      socialMediaX: socialMediaX || existingProfile.rows[0].socialMediax,
      socialMediaTikTok:
        socialMediaTikTok || existingProfile.rows[0].socialMediatiktok,
      icon: icon || existingProfile.rows[0].icon,
    };

    // Atualiza o perfil no banco de dados
    const {
      rows: [newProfile],
    } = await db.query(
      `UPDATE user_profile 
       SET name = $1, 
        familyName = $2, 
        bio = $3, 
        location = $4,
        birthday = $5, 
        socialmediaInstagram = $6, 
        socialMediaX = $7, 
        socialMediaTikTok = $8,
        icon = $9
       WHERE userId = $10 
       RETURNING *`,
      [
        updatedProfile.name,
        updatedProfile.familyName,
        updatedProfile.bio,
        updatedProfile.location,
        updatedProfile.birthday,
        updatedProfile.socialmediaInstagram,
        updatedProfile.socialMediaX,
        updatedProfile.socialMediaTikTok,
        icon,
        userId,
      ]
    );
    return res.status(200).json({
      message: "Perfil atualizado com sucesso!",
      profile: newProfile,
    });
  } catch (error) {
    next(error);
  }
};

exports.AuthMiddleware = async (req, res, next) => {
  try {
    // Verifica se o token está no header
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Token de autorização não fornecido" });
    }

    // Verifica se o token é válido
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Consulta o usuário no banco de dados com base no ID do token decodificado
    const user = await db.query("SELECT * FROM users WHERE id = $1", [
      decodedToken.id,
    ]);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Define o objeto do usuário na requisição para uso nas rotas protegidas
    req.user = user.rows[0];

    // Continua com a execução das rotas protegidas
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.GetRatingCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const ratingCount = await db.query(
      `
      SELECT rating, COUNT(*) 
      FROM reviews r
      JOIN users u ON r.userId = u.id
      WHERE userId = $1
      GROUP BY rating
      ORDER BY rating DESC;      
      `,
      [userId]
    );

    const ratings = ratingCount.rows;

    res.status(200).json({
      rating: ratings,
    });
  } catch (error) {
    next(error);
  }
};

exports.GetRatingCountByUser = async (req, res, next) => {
  try {
    const userProfile = req.query.userProfile;

    const userIdQuery = await db.query(
      "SELECT * FROM user_profile WHERE userProfile = $1",
      [userProfile]
    );

    const userId = userIdQuery.rows[0].userid;

    const ratingCount = await db.query(
      `
      SELECT rating, COUNT(*) 
      FROM reviews r
      JOIN users u ON r.userId = u.id
      WHERE userId = $1
      GROUP BY rating
      ORDER BY rating DESC;      
      `,
      [userId]
    );

    const ratings = ratingCount.rows;

    res.status(200).json({
      rating: ratings,
    });
  } catch (error) {
    next(error);
  }
};
