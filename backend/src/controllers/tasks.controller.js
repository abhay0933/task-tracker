const { validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { logActivity, computeDiff } = require('../utils/activityLogger');

async function createTask(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  const { title, description, status, priority, dueDate } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        userId: req.user.userId,
        title,
        description: description || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    await logActivity(task.id, req.user.userId, 'CREATED', null, {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    });

    return res.status(201).json({ task });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function listTasks(req, res) {
  const {
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = '1',
    limit = '10',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const validSortFields = ['dueDate', 'priority', 'createdAt', 'updatedAt', 'title'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

  const where = { userId: req.user.userId };

  if (status && ['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { [orderField]: orderDir },
        skip,
        take: limitNum,
        include: { attachments: { select: { id: true, filename: true } } },
      }),
      prisma.task.count({ where }),
    ]);

    return res.json({
      tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getTask(req, res) {
  const { id } = req.params;
  try {
    const task = await prisma.task.findFirst({
      where: { id, userId: req.user.userId },
      include: {
        attachments: true,
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.json({ task });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateTask(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  const { id } = req.params;

  try {
    const existing = await prisma.task.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const { title, description, status, priority, dueDate } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    const { oldChanged, newChanged } = computeDiff(existing, task);
    if (Object.keys(oldChanged).length > 0) {
      await logActivity(task.id, req.user.userId, 'UPDATED', oldChanged, newChanged);
    }

    return res.json({ task });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteTask(req, res) {
  const { id } = req.params;

  try {
    const task = await prisma.task.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await logActivity(id, req.user.userId, 'DELETED', {
      title: task.title,
      status: task.status,
    }, null);

    await prisma.task.delete({ where: { id } });
    return res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getTaskActivity(req, res) {
  const { id } = req.params;

  try {
    const task = await prisma.task.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const logs = await prisma.activityLog.findMany({
      where: { taskId: id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return res.json({ logs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getTaskStats(req, res) {
  try {
    const userId = req.user.userId;
    const now = new Date();

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'TODO' } }),
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { userId, status: 'DONE' } }),
      prisma.task.count({
        where: {
          userId,
          status: { not: 'DONE' },
          dueDate: { lt: now },
        },
      }),
    ]);

    return res.json({ total, todo, inProgress, done, overdue });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createTask, listTasks, getTask, updateTask, deleteTask, getTaskActivity, getTaskStats };
