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
    const { rows: [userProfile], } = await db.query(
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

    return userProfile;
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

    return userProfile;
  }

  async getProfileByUser({ userProfileParam }) {
    const userIdQuery = await db.query(
      "SELECT * FROM user_profile WHERE LOWER(userProfile) = LOWER($1)",
      [userProfileParam]
    );

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

    return userProfile
  }

  async searchUsers({ searchQuery }) {
    const { rows: users } = await db.query(
      "SELECT * FROM user_profile WHERE LOWER(userProfile) LIKE $1",
      [`%${searchQuery}%`]
    );

    return users;
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

    return newProfile;
  }

  async findUserProfile({ userId }) {
    const existingProfile = await db.query(
      "SELECT * FROM user_profile WHERE userId = $1",
      [userId]
    );

    return existingProfile.rows[0];

  }

  async updateUserProfilePartially(updatedProfile, userId) {
    const newProfile = await db.query(
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
        updatedProfile.icon,
        userId
      ]
    );

    return newProfile.rows[0];
  }
  
  async getRatingCount({ userId }) {
    const ratingCount = await db.query(
      `
      SELECT u.username, rating, COUNT(*) 
      FROM reviews r
      JOIN users u ON r.userId = u.id
      WHERE userId = $1
      GROUP BY rating, u.username
      ORDER BY rating DESC;      
      `,
      [userId]
    );

    return ratingCount.rows;
  }

  async getRatingCountByUser({ userProfile }) {
    const userIdQuery = await db.query(
      "SELECT * FROM user_profile WHERE LOWER(userProfile) LIKE $1",
      [userProfile]
    );

    const userId = userIdQuery.rows[0].userid;

    const ratingCount = await db.query(
      `
      SELECT u.username, rating, COUNT(*) 
      FROM reviews r
      JOIN users u ON r.userId = u.id
      WHERE userId = $1
      GROUP BY rating, u.username
      ORDER BY rating DESC;      
      `,
      [userId]
    );

    return ratingCount.rows;
  }


}

module.exports = { UserRepository };
