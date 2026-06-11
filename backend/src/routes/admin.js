const { Router } = require('express');
const authenticate = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const { adminListTasks, adminListUsers } = require('../controllers/admin.controller');

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/tasks', adminListTasks);
router.get('/users', adminListUsers);

module.exports = router;
