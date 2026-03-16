const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    // extract the user data from the request body
    const { username, email, password } = req.body;

    //check if the user already exists in the database
    const checkExistingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    // if user exists, return an error response
    if (checkExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists!",
      });
    }

    // hash user password before saving to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create a new user and store in the db
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    if (newUser) {
      res.status(201).json({
        success: true,
        message: "User registered successfully!",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Unable to register new user!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred! Please try again later.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //check if the user already exists in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User doesn't exist with the username: ${username}`,
      });
    }

    // check if password is correct or not
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // create user token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred! Please try again later.",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    // extract the old and new password from the request body
    const { oldPassword, newPassword } = req.body;

    // find the current login user in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    // check if old password is correct or not
    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "The old password is incorrect! Please try again.",
      });
    }

    // hash the new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    // update the user's password
    user.password = newHashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred! Please try again later.",
    });
  }
};

module.exports = { loginUser, registerUser, changePassword };
