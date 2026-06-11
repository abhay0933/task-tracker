const { Router } = require('express');
const { body } = require('express-validator');
const authenticate = require('../middleware/auth');
const {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  getTaskActivity,
  getTaskStats,
} = require('../controllers/tasks.controller');

const router = Router();

const taskStatusValues = ['TODO', 'IN_PROGRESS', 'DONE'];
const priorityValues = ['LOW', 'MEDIUM', 'HIGH'];

router.use(authenticate);

router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('status')
      .optional()
      .isIn(taskStatusValues)
      .withMessage('Status must be TODO, IN_PROGRESS, or DONE'),
    body('priority')
      .optional()
      .isIn(priorityValues)
      .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid due date'),
  ],
  createTask
);

router.get('/stats', getTaskStats);

router.get('/', listTasks);

router.get('/:id', getTask);

router.patch(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 1 }).withMessage('Title must not be empty'),
    body('status')
      .optional()
      .isIn(taskStatusValues)
      .withMessage('Status must be TODO, IN_PROGRESS, or DONE'),
    body('priority')
      .optional()
      .isIn(priorityValues)
      .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid due date'),
  ],
  updateTask
);

router.delete('/:id', deleteTask);

router.get('/:id/activity', getTaskActivity);

module.exports = router;
