const express = require('express');
const router = express.Router();
const taskController = require('../controllers/tasksController');

router.route('/')
    .get(taskController.getAllTasks)
    .post(taskController.createNewTask)
    .patch(taskController.updateTask)
    .delete(taskController.deleteTask)

module.exports = router;