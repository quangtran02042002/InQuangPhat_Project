const Todo = require('../models/Todo');

// @desc    Lấy danh sách todo (hỗ trợ filter)
// @route   GET /api/todos
const getTodos = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.category) filter.category = req.query.category;

    const todos = await Todo.find(filter)
      .sort({ status: 1, dueDate: 1, priority: -1, createdAt: -1 })
      .populate('createdBy', 'name');
    res.json(todos);
  } catch (error) {
    console.error('[getTodos]', error);
    res.status(500).json({ message: 'Lỗi tải danh sách công việc' });
  }
};

// @desc    Tạo todo mới
// @route   POST /api/todos
const createTodo = async (req, res) => {
  try {
    const {
      title, description, priority, dueDate,
      category, assignedTo, targetQuantity, autoCompleteThreshold
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Tiêu đề không được để trống' });
    }

    const todo = await Todo.create({
      title: title.trim(),
      description: description || '',
      priority: priority || 'medium',
      status: 'pending',
      progress: 0,
      targetQuantity: Number(targetQuantity) || 0,
      completedQuantity: 0,
      autoCompleteThreshold: Number(autoCompleteThreshold) || 90,
      dueDate: dueDate ? new Date(dueDate) : null,
      category: category || 'general',
      assignedTo: assignedTo || '',
      createdBy: req.user ? req.user._id : null,
    });

    const populated = await Todo.findById(todo._id).populate('createdBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    console.error('[createTodo]', error);
    res.status(500).json({ message: 'Lỗi khi tạo công việc: ' + error.message });
  }
};

// @desc    Cập nhật todo
// @route   PUT /api/todos/:id
const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Không tìm thấy công việc' });
    }

    const {
      title, description, priority, status, dueDate,
      category, assignedTo, progress, completedQuantity,
      targetQuantity, autoCompleteThreshold
    } = req.body;

    if (title !== undefined) todo.title = title.trim();
    if (description !== undefined) todo.description = description;
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate ? new Date(dueDate) : null;
    if (category !== undefined) todo.category = category;
    if (assignedTo !== undefined) todo.assignedTo = assignedTo;
    if (autoCompleteThreshold !== undefined) todo.autoCompleteThreshold = Number(autoCompleteThreshold);
    if (targetQuantity !== undefined) todo.targetQuantity = Number(targetQuantity);

    // Cập nhật tiến độ
    if (completedQuantity !== undefined) {
      todo.completedQuantity = Number(completedQuantity);
      // Tự động tính progress nếu có targetQuantity
      if (todo.targetQuantity > 0) {
        todo.progress = Math.min(100, Math.round((todo.completedQuantity / todo.targetQuantity) * 100));
      }
    }
    if (progress !== undefined && (targetQuantity === undefined || todo.targetQuantity === 0)) {
      todo.progress = Math.min(100, Math.max(0, Number(progress)));
    }

    // Tự động đánh dấu hoàn thành nếu tiến độ >= ngưỡng
    if (todo.progress >= todo.autoCompleteThreshold && todo.status !== 'done') {
      todo.status = 'done';
      todo.progress = 100;
      todo.completedAt = new Date();
    }

    // Cập nhật status thủ công
    if (status !== undefined) {
      todo.status = status;
      if (status === 'done') {
        todo.progress = 100;
        todo.completedAt = new Date();
      } else {
        todo.completedAt = null;
        // Nếu undo từ done → in_progress, giữ nguyên progress trước đó
      }
    }

    const updated = await todo.save();
    const populated = await Todo.findById(updated._id).populate('createdBy', 'name');
    res.json(populated);
  } catch (error) {
    console.error('[updateTodo]', error);
    res.status(500).json({ message: 'Lỗi cập nhật công việc: ' + error.message });
  }
};

// @desc    Xóa todo
// @route   DELETE /api/todos/:id
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Không tìm thấy công việc' });
    }
    res.json({ message: 'Đã xóa công việc' });
  } catch (error) {
    console.error('[deleteTodo]', error);
    res.status(500).json({ message: 'Lỗi khi xóa công việc' });
  }
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
