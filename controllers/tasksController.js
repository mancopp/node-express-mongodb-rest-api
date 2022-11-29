const Task = require('../models/Task');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const getAllTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find().lean();

    if (!tasks?.length) {
        return res.status(400).json({ message: 'No tasks found' });
    }

    const tasksWithUser = await Promise.all(tasks.map(async (task) => {
        const user = await User.findById(task.user).lean().exec();
        return { ...task, username: user.username };
    }))

    res.json(tasksWithUser);
});

const createNewTask = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body;

    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const targetUser = await User.findOne({ user }).lean().exec();

    if (!targetUser) {
        return res.status(400).json({ message: 'No user with given username found' });
    }

    const duplicate = await Task.findOne({ title }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate task title' });
    }

    const task = await Task.create({ user: targetUser._id, title, text });

    if (task) {
        return res.status(201).json({ message: 'New task created' });
    } else {
        return res.status(400).json({ message: 'Invalid task data received' });
    }

});

const updateTask = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body;

    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const task = await Task.findById(id).exec();

    if (!task) {
        return res.status(400).json({ message: 'Task not found' });
    }

    const duplicate = await Task.findOne({ title }).lean().exec();

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate task title' });
    }

    task.user = user;
    task.title = title;
    task.text = text;
    task.completed = completed;

    const updatedTask = await task.save();

    res.json(`'${updatedTask.title}' updated`);
});

const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Task ID required' });
    }

    const task = await Task.findById(id).exec();

    if (!task) {
        return res.status(400).json({ message: 'Task not found' });
    }

    const result = await task.deleteOne();

    const reply = `Task '${result.title}' with ID ${result._id} deleted`;

    res.json(reply);
});

module.exports = {
    getAllTasks,
    createNewTask,
    updateTask,
    deleteTask
};