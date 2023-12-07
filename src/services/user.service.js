const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const formatarDataParaString = require("../utils/formatDate");

const { UserRepository } = require("../repositories/user.repository");

const userRepository = new UserRepository();


class UserService {
  async signUp({ username, email, password }) {
    // Validation of input fields
    if (!username || !email || !password) {
      throw new Error("All fields are required");
    }

    // Validation to check if the email is already in use
    const emailExists = await userRepository.findUser(email);

    if (emailExists.length >= 1) {
      throw new Error("Email already taken");
    }

    // Validation to check if the username is already in use
    const userExists = await userRepository.findUser(username);

    if (userExists.length >= 1) {
      throw new Error("User already taken");
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const { rows: newUser } = await userRepository.signUp({
      username,
      email,
      hashedPassword,
    });

    // Generate an authentication token
    const token = jwt.sign(
      { id: newUser[0].id, username: newUser[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    // Return the newly created user and the authentication token
    return {
      user: newUser[0],
      token,
    };

  }

  async login({ email_or_username, password }) {
    // Validation of input fields
    if (!email_or_username || !password) {
      throw new Error("Email/username and password are required");
    }

    // Query the user in the database based on the email or username
    const user = await userRepository.login(email_or_username);

    // Check if the user with the provided email/username exists
    if (!user.rows.length) {
      throw new Error("Invalid email/username or password");
    }

    // Verify if the provided password matches the password in the database
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!isPasswordCorrect) {
      throw new Error("Invalid email/username or password");
    }

    // Generate an authentication token
    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return the user information and the authentication token
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
    // Hash the new password before updating it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user password in the database
    await userRepository.changePassword({ userId, hashedPassword });

    // Return a success message
    return {
      message: "Password changed successfully!",
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

    // Create a user profile
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

    // Return a success message
    return {
      message: "Profile created successfully",
      profile: userprofile
    };

  }

  async getUserProfile({ userId }) {
    // Retrieve the user profile from the database based on the provided userId
    const userProfile = await userRepository.getUserProfile({ userId })

    // Check if the user profile is undefined
    if (userProfile === undefined) {
      // If undefined, create a default profile indicating that the user doesn't have a profile
      userProfile = {
        haveProfile: false,
      };
    }

    // Format the birthday date to the 'DD/MM/YYYY' format
    if (userProfile && userProfile.birthday) {
      const formattedDate = formatarDataParaString(new Date(userProfile.birthday));
      userProfile.birthday = formattedDate;
    }

    // Return a success message along with the found user profile
    return {
      message: "Profile found successfully!",
      perfil: userProfile,
    };

  }

  async getProfileByUser({ userProfileParam }) {
    // Retrieve the user profile from the database based on the provided userProfileParam
    const userProfile = await userRepository.getProfileByUser({ userProfileParam })

    // Format the birthday date to the 'DD/MM/YYYY' format if a profile is found
    if (userProfile && userProfile.birthday) {
      const formattedDate = formatarDataParaString(new Date(userProfile.birthday));
      userProfile.birthday = formattedDate;
    }

    // Return a success message along with the found user profile
    return {
      message: "Profile found successfully!",
      perfil: userProfile,
    };

  }

  async searchUsers({ searchQuery }) {
    // Search for users in the database based on the provided searchQuery
    const users = await userRepository.searchUsers({ searchQuery })

    // Check if no users are found
    if (!users.length) {
      throw new Error("No users found with the provided query");
    }

    // Map the retrieved user data to create profiles
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

    // Return a success message along with the found user profiles
    return {
      message: "Users found successfully!",
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
    // Update the user profile in the database with the provided information
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
    });

    // Return a success message along with the updated user profile
    return {
      message: "User updated successfully!",
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

    // Find the user profile in the database based on the provided userId
    const userProfile = await userRepository.findUserProfile({ userId });

    // Check if the user profile is not found
    if (!userProfile) {
      throw new Error("User not found");
    }

    // Create an updated profile object with the provided or existing values
    const updatedProfile = {
      name: name !== undefined ? name : userProfile.name,
      familyName: familyName !== undefined ? familyName : userProfile.familyname,
      bio: bio !== undefined ? bio : userProfile.bio,
      location: location !== undefined ? location : userProfile.location,
      birthday: birthday !== undefined ? birthday : userProfile.birthday,
      socialmediaInstagram: socialmediaInstagram !== undefined ? socialmediaInstagram : userProfile.socialmediainstagram,
      socialMediaX: socialMediaX !== undefined ? socialMediaX : userProfile.socialmediax,
      socialMediaTikTok: socialMediaTikTok !== undefined ? socialMediaTikTok : userProfile.socialmediatiktok,
      icon: icon !== undefined ? icon : userProfile.icon,
    };

    // Update the user profile in the database with the partially updated values
    const newProfile = await userRepository.updateUserProfilePartially(updatedProfile, userId);

    // Return a success message along with the updated user profile
    return {
      message: "User updated successfully!",
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
