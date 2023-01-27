const express = require("express");
const router = express.Router();
const questionsController = require('../controllers/questionsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
  .get(questionsController.getAllTasks)
  .post(questionsController.createNewTask)
  .patch(questionsController.updateTask)
  .delete(questionsController.deleteTask)

module.exports = router