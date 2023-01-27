const express = require("express");
const router = express.Router();
const interviewsController = require('../controllers/interviewsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
  .get(interviewsController.getAllTasks)
  .post(interviewsController.createNewTask)
  .patch(interviewsController.updateTask)
  .delete(interviewsController.deleteTask)

module.exports = router