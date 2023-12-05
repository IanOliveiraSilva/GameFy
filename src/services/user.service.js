const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const formatarDataParaString = require("../utils/formatDate");

const { UserRepository } = require("../repositories/user.repository");

const userRepository = new UserRepository();


class UserService {
  async signUp({ username, email, password }) {
    // Validação dos campos de entrada
    if (!username || !email || !password) {
      throw new Error("All fields are required");
    }

    // Validação para saber se o email já está em uso
    const emailExists = await userRepository.findUser(email);

    if (emailExists.length >= 1) {
      throw new Error("Email already taken");
    }

    // Validação para saber se o usaurio já está em uso
    const userExists = await userRepository.findUser(username);

    if (userExists.length >= 1) {
      throw new Error("User already taken");
    }

    // Hash da senha antes de salvar no banco de dados
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria novo usuario no banco de dados
    const { rows: newUser } = await userRepository.signUp({
      username,
      email,
      hashedPassword,
    });

    // Gera um token de autenticação
    const token = jwt.sign(
      { id: newUser[0].id, username: newUser[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    return {
      user: newUser[0],
      token,
    };
  }

  async login({ email_or_username, password }) {
    // Validação dos campos de entrada
    if (!email_or_username || !password) {
      throw new Error("Email/username and password are required");
    }

    // Consulta o usuário no banco de dados pelo email ou nome de usuário
    const user = await userRepository.login(email_or_username);

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

    await userRepository.changePassword({ userId, hashedPassword });

    return {
      message: "Senha alterada com sucesso!",
    };
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

    const userprofile = await userRepository.createUserProfile({
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

    return {
      message: "Perfil criado com sucesso",
      profile: userprofile
    };
  }

  async getUserProfile({ userId }) {
    const userProfile = await userRepository.getUserProfile({ userId })

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
      perfil: userProfile,
    };
  }

  async getProfileByUser({ userProfileParam }) {
    const userProfile = await userRepository.getProfileByUser({ userProfileParam })

    // Formata a data de nascimento para o formato 'DD/MM/AAAA'
    if (userProfile && userProfile.birthday) {
      const dataFormatada = formatarDataParaString(
        new Date(userProfile.birthday)
      );
      userProfile.birthday = dataFormatada;
    }

    return {
      message: "Perfil encontrado com sucesso!",
      perfil: userProfile,
    };
  }

  async searchUsers({ searchQuery }) {
    const users = await userRepository.searchUsers({ searchQuery })

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
      users: profiles,
    };
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
    userId,
  }) {
    const newProfile = await userRepository.updateUserProfile({
      name,
      familyName,
      bio,
      location,
      birthday,
      socialmediaInstagram,
      socialMediaX,
      socialMediaTikTok,
      userId,
    })

    return {
      message: "Usuario atualizado com sucesso!",
      user: newProfile,
    };
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
    userId,
  }) {

    const newProfile = await userRepository.updateUserProfilePartially({
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

    return {
      message: "Usuario atualizado com sucesso!",
      user: newProfile,
    };
  }

  async getRatingCount({ userId }) {
    const ratings = await userRepository.getRatingCount({ userId });

    return {
      ratings: ratings,
    };
  }

  async GetRatingCountByUser({ userProfile }) {
    const ratings = await userRepository.getRatingCountByUser({ userProfile });

    return {
      ratings: ratings,
    };
  }
}

module.exports = { UserService };
