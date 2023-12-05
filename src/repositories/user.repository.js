const db = require("../config/db");

class UserRepository {
  async findUser(email_or_username) {
    const { rows } = await db.query(
      "SELECT * FROM users WHERE email = $1 OR username = $1",
      [email_or_username]
    );

    return rows;
  }
  async signUp({ username, email, hashedPassword }) {
    const { rows } = await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    return { rows };
  }

  async login(email_or_username) {
    const { rows } = await db.query(
      "SELECT u.id, u.username, u.email, u.password, u.created_at, up.icon FROM users u LEFT JOIN user_profile up ON up.userid = u.id WHERE username  = $1 OR email  = $1;",
      [email_or_username]
    );
    return { rows };
  }

  async changePassword({ userId, hashedPassword }) {
    await db.query(
      `
      UPDATE users
      SET password = $1 
      WHERE id = $2
      `,
      [hashedPassword, userId]
    );
  }
}

module.exports = { UserRepository };
