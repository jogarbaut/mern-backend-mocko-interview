const Question = require("../models/Question")
const User = require("../models/User")

// @desc Get all questions
// @route GET /questions
// @access Private
const getAllQuestions = async (req, res) => {
  // Get all questions from MongoDB
  const questions = await Question.find().lean()

  // If no questions
  if (!questions?.length) {
    return res.status(400).json({ message: "No questions found" })
  }

  // Add username to each question before sending the response
  const questionsWithUser = await Promise.all(
    questions.map(async (question) => {
      const user = await User.findById(question.user).lean().exec()
      return { ...question, username: user.username }
    })
  )

  res.json(questionsWithUser)
}

// @desc Create new question
// @route POST /questions
// @access Private
const createNewQuestion = async (req, res) => {
  const { user, interview, body } = req.body

  // Confirm data
  if (!user || !interview || !body) {
    return res.status(400).json({ message: "All fields are required" })
  }

  // Create and store the new user
  const question = await Question.create({ user, interview, body })

  if (question) {
    // Created
    return res.status(201).json({ message: "New question created" })
  } else {
    return res.status(400).json({ message: "Invalid question data received" })
  }
}

// @desc Update a question
// @route PATCH /questions
// @access Private
const updateQuestion = async (req, res) => {
  const { id, user, interview, body } = req.body

  // Confirm data
  if (!id || !user || !interview || !body) {
    return res.status(400).json({ message: "All fields are required" })
  }

  // Confirm question exists to update
  const question = await Question.findById(id).exec()

  if (!question) {
    return res.status(400).json({ message: "Question not found" })
  }

  question.user = user
  question.interview = interview
  question.body = body

  const updatedQuestion = await question.save()

  res.json(`'${updatedQuestion.body}' updated`)
}

// @desc Delete a question
// @route DELETE /questions
// @access Private
const deleteQuestion = async (req, res) => {
  const { id } = req.body

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Question ID required" })
  }

  // Confirm question exists to delete
  const question = await Question.findById(id).exec()

  if (!question) {
    return res.status(400).json({ message: "Question not found" })
  }

  const result = await question.deleteOne()

  const reply = `Question '${result.body}' with ID ${result._id} deleted`

  res.json(reply)
}

module.exports = {
  getAllQuestions,
  createNewQuestion,
  updateQuestion,
  deleteQuestion,
}
