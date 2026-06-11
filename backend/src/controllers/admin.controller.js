const prisma = require('../config/prisma');

async function adminListTasks(req, res) {
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

  const where = {};

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
        include: {
          user: { select: { id: true, name: true, email: true } },
          attachments: { select: { id: true, filename: true } },
        },
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

async function adminListUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { adminListTasks, adminListUsers };
