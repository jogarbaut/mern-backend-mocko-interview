const Interview = require("../models/Interview")
const User = require("../models/User")

// @desc Get all interviews
// @route GET /interviews
// @access Private
const getAllInterviews = async (req, res) => {
  // Get all interviews from MongoDB
  const interviews = await Interview.find().lean()

  // If no interviews
  if (!interviews?.length) {
    return res.status(400).json({ message: "No interviews found" })
  }

  // Add username to each interview before sending the response
  const interviewsWithUser = await Promise.all(
    interviews.map(async (interview) => {
      const user = await User.findById(interview.user).lean().exec()
      return { ...interview, username: user.username }
    })
  )

  res.json(interviewsWithUser)
}

// @desc Create new interview
// @route POST /interviews
// @access Private
const createNewInterview = async (req, res) => {
  const { user, title } = req.body

  // Confirm data
  if (!user || !title ) {
    return res.status(400).json({ message: "All fields are required" })
  }

  // Check for duplicate title
  const duplicate = await Interview.findOne({ title }).collation({ locale: "en", strength: 2 }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate interview title" })
  }

  // Create and store the new user
  const interview = await Interview.create({ user, title })

  if (interview) {
    // Created
    return res.status(201).json({ message: "New interview created" })
  } else {
    return res.status(400).json({ message: "Invalid interview data received" })
  }
}

// @desc Update a interview
// @route PATCH /interviews
// @access Private
const updateInterview = async (req, res) => {
  const { id, user, title } = req.body

  // Confirm data
  if (!id || !user || !title ) {
    return res.status(400).json({ message: "All fields are required" })
  }

  // Confirm interview exists to update
  const interview = await Interview.findById(id).exec()

  if (!interview) {
    return res.status(400).json({ message: "Interview not found" })
  }

  // Check for duplicate title
  const duplicate = await Interview.findOne({ title }).collation({ locale: "en", strength: 2 }).lean().exec()

  // Allow renaming of the original interview
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate interview title" })
  }

  interview.user = user
  interview.title = title

  const updatedInterview = await interview.save()

  res.json(`'${updatedInterview.title}' updated`)
}

// @desc Delete a interview
// @route DELETE /interviews
// @access Private
const deleteInterview = async (req, res) => {
  const { id } = req.body

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Interview ID required" })
  }

  // Confirm interview exists to delete
  const interview = await Interview.findById(id).exec()

  if (!interview) {
    return res.status(400).json({ message: "Interview not found" })
  }

  const result = await interview.deleteOne()

  const reply = `Interview '${result.title}' with ID ${result._id} deleted`

  res.json(reply)
}

module.exports = {
  getAllInterviews,
  createNewInterview,
  updateInterview,
  deleteInterview,
}
