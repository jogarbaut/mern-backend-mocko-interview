const User = require("../models/User")
const bcrypt = require("bcrypt")

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
  // Get all users from MongoDB
  const users = await User.find().select("-password").lean()

  // If no users
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" })
  }

  res.json(users)
}

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
  const { email, firstName, lastName, password } = req.body

  // Confirm data
  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({ message: "All fields are required" })
  }

  // Check for duplicate email
  const duplicate = await User.findOne({ email }).collation({ locale: "en", strength: 2 }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: "Email is already in use" })
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

  const userObject = { email, firstName, lastName, password: hashedPwd }

  // Create and store new user
  const user = await User.create(userObject)

  if (user) {
    //created
    res.status(201).json({ message: `New user ${email} created` })
  } else {
    res.status(400).json({ message: "Invalid user data received" })
  }
}

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
  const { id, email, firstName, lastName, password, darkMode, interviewFontSize } = req.body

  // Confirm data
  if (!id || !email || !firstName || !lastName || !darkMode || !interviewFontSize ) {
    return res.status(400).json({ message: "All fields except password are required" })
  }

  // Check if user exists
  const user = await User.findById(id).exec()

  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  // Check for duplicate
  const duplicate = await User.findOne({ email }).collation({ locale: "en", strength: 2 }).lean().exec()

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Email is already in use" })
  }

  user.email = email
  user.firstName = firstName
  user.lastName = lastName
  user.darkMode = darkMode
  user.interviewFontSize = interviewFontSize

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10) // salt rounds
  }

  const updatedUser = await user.save()

  res.json({ message: `${updatedUser.firstName} updated ${updatedUser.lastName}` })
}

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
  const { id } = req.body

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" })
  }

  // Check if user exists
  const user = await User.findById(id).exec()

  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  const result = await user.deleteOne()

  const reply = `User ${result.email} with ID ${result._id} deleted`

  res.json(reply)
}

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
}
