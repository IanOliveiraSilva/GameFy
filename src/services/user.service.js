const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

function formatarDataParaString(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

class UserService {

  async signUp({ username, email, password }) {
    // Validação dos campos de entrada
    if (!username || !email || !password) {
      throw new Error("All fields are required");
    }

    // Validação para saber se o email já está em uso
    const emailExists = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (emailExists.rows.length >= 1) {
      throw new Error("Email already taken");
    }

    // Validação para saber se o usaurio já está em uso
    const userExists = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (userExists.rows.length > 0) {
      throw new Error("User already taken");
    }

    // Hash da senha antes de salvar no banco de dados
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria novo usuario no banco de dados
    const newUser = await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    // Gera um token de autenticação
    const token = jwt.sign(
      { id: newUser.rows[0].id, username: newUser.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    return {
      user: newUser.rows[0],
      token,
    };
  }

  async login({ email_or_username, password }) {
    // Validação dos campos de entrada
    if (!email_or_username || !password) {
      throw new Error("Email/username and password are required");
    }

    // Consulta o usuário no banco de dados pelo email ou nome de usuário
    const user = await db.query(
      "SELECT u.id, u.username, u.email, u.password, u.created_at, up.icon FROM users u LEFT JOIN user_profile up ON up.userid = u.id WHERE username  = $1 OR email  = $1;",
      [email_or_username]
    );

    if (!user.rows.length) {
      throw new Error("Invalid email/username or password");
    }

    // Verifica se a senha fornecida corresponde à senha no banco de dados
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!isPasswordCorrect) {
      throw new Error("Invalid email/username or password");
    }

    // Gera um token de autenticação
    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email,
        icon: user.rows[0].icon,
      },
      token,
    };
  }

  async changePassword({ userId, newPassword }) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      `
      UPDATE users
      SET password = $1 
      WHERE id = $2
      `,
      [hashedPassword, userId]
    );

    return {
      message: "Senha alterada com sucesso!"
    }
  }

  async createUserProfile({
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
  }) {

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

    return {
      message: "Perfil criado com sucesso",
      body: {
        profile: userProfile,
      },
    };
  }

  async getUserProfile({ userId }) {
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

    return {
      message: "Perfil encontrado com sucesso!",
      perfil: userProfile
    }
  }

  async getProfileByUser({ userProfileParam }) {
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

    return {
      message: "Perfil encontrado com sucesso!",
      perfil: userProfile
    }
  }

  async searchUsers({ searchQuery }) {
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

    return {
      message: "Usuarios encontrados com sucesso!",
      users: profiles
    }
  }

  async updateUserProfile({
    name,
    familyName,
    bio,
    location,
    birthday,
    socialmediaInstagram,
    socialMediaX,
    socialMediaTikTok,
    userId
  }) {

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

    return {
      message: "Usuario atualizado com sucesso!",
      user: newProfile
    }
  }

  async updateUserProfilePartially({
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
  }) {

    // Consulta o perfil existente pelo userId
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
      socialmediaInstagram: socialmediaInstagram || existingProfile.rows[0].socialmediaInstagram,
      socialMediaX: socialMediaX || existingProfile.rows[0].socialMediax,
      socialMediaTikTok: socialMediaTikTok || existingProfile.rows[0].socialMediatiktok,
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

    return {
      message: "Usuario atualizado com sucesso!",
      user: newProfile
    }
  }

  async AuthMiddleware({ token, res, req, next }) {
    /// Verifica se o token foi fornecido
    if (!token) {
      return res
        .status(401)
        .json({ message: "Token de autorização não fornecido" });
    }

    // Decodifica o token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Consulta o usuário no banco de dados com base no ID do token decodificado
    const user = await db.query("SELECT * FROM users WHERE id = $1", [
      decodedToken.id,
    ]);

    // Verifica se o token é válido
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Define o objeto do usuário na requisição para uso nas rotas protegidas
    req.user = user.rows[0];

    // Continua com a execução das rotas protegidas
    next();
  }

  async getRatingCount({ userId }) {
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

    return {
      ratings: ratings
    }
  }

  async GetRatingCountByUser({userProfile}){
    const userIdQuery = await db.query(
      "SELECT * FROM user_profile WHERE LOWER(userProfile) LIKE $1",
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

    return {
      ratings: ratings
    }
  }
}

module.exports = { UserService };
