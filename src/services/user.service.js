const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

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
}

module.exports = { UserService };
