const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const { signToken } = require('../src/utils/jwt');

let userA, userB, tokenA, tokenB;

beforeAll(async () => {
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('password123', 10);

  await prisma.user.deleteMany({ where: { email: { endsWith: '@test-tasks.com' } } });

  userA = await prisma.user.create({
    data: { email: 'usera@test-tasks.com', name: 'User A', passwordHash: hash },
  });
  userB = await prisma.user.create({
    data: { email: 'userb@test-tasks.com', name: 'User B', passwordHash: hash },
  });

  tokenA = signToken({ userId: userA.id, email: userA.email, role: userA.role });
  tokenB = signToken({ userId: userB.id, email: userB.email, role: userB.role });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: '@test-tasks.com' } } });
  await prisma.$disconnect();
});

describe('POST /api/tasks', () => {
  it('should create a task for authenticated user', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Test Task', description: 'Some description', priority: 'HIGH' });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe('Test Task');
    expect(res.body.task.userId).toBe(userA.id);
    expect(res.body.task.priority).toBe('HIGH');
  });

  it('should reject missing title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ description: 'No title' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'No auth' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/tasks', () => {
  beforeAll(async () => {
    await prisma.task.createMany({
      data: [
        { userId: userA.id, title: 'Alpha Task', status: 'TODO', priority: 'LOW' },
        { userId: userA.id, title: 'Beta Task', status: 'IN_PROGRESS', priority: 'MEDIUM' },
        { userId: userA.id, title: 'Gamma Task', status: 'DONE', priority: 'HIGH' },
      ],
    });
  });

  it('should list only tasks belonging to the authenticated user', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    res.body.tasks.forEach((t) => expect(t.userId).toBe(userA.id));
  });

  it('should filter tasks by status', async () => {
    const res = await request(app)
      .get('/api/tasks?status=TODO')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    res.body.tasks.forEach((t) => expect(t.status).toBe('TODO'));
  });

  it('should search tasks by title', async () => {
    const res = await request(app)
      .get('/api/tasks?search=Alpha')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.some((t) => t.title.includes('Alpha'))).toBe(true);
  });

  it('should paginate results', async () => {
    const res = await request(app)
      .get('/api/tasks?page=1&limit=2')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBeLessThanOrEqual(2);
    expect(res.body.pagination.limit).toBe(2);
  });
});

describe('DELETE /api/tasks/:id', () => {
  let taskId;

  beforeAll(async () => {
    const task = await prisma.task.create({
      data: { userId: userA.id, title: 'Task to Delete' },
    });
    taskId = task.id;
  });

  it('should delete own task successfully', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("should return 404 when trying to delete another user's task", async () => {
    const task = await prisma.task.create({
      data: { userId: userA.id, title: "UserA's Task" },
    });

    const res = await request(app)
      .delete(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);

    await prisma.task.delete({ where: { id: task.id } });
  });
});
