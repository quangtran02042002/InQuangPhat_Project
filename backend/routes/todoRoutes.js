const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getTodos, createTodo, updateTodo, deleteTodo } = require('../controllers/todoController');

router.route('/')
  .get(protect, admin, getTodos)
  .post(protect, admin, createTodo);

router.route('/:id')
  .put(protect, admin, updateTodo)
  .delete(protect, admin, deleteTodo);

module.exports = router;
