const prisma = require('../config/prisma');

/**
 * Log a task activity event.
 * @param {string} taskId
 * @param {string} userId
 * @param {string} action  - e.g. 'CREATED', 'UPDATED', 'DELETED'
 * @param {object|null} oldValues
 * @param {object|null} newValues
 */
async function logActivity(taskId, userId, action, oldValues = null, newValues = null) {
  try {
    await prisma.activityLog.create({
      data: {
        taskId,
        userId,
        action,
        oldValues,
        newValues,
      },
    });
  } catch (err) {
    // Non-critical — log but don't throw
    console.error('Activity log error:', err.message);
  }
}

/**
 * Compute a diff between old and new task objects.
 * Returns only the fields that changed.
 */
function computeDiff(oldObj, newObj) {
  const fields = ['title', 'description', 'status', 'priority', 'dueDate'];
  const oldChanged = {};
  const newChanged = {};

  for (const field of fields) {
    const oldVal = oldObj[field] ?? null;
    const newVal = newObj[field] ?? null;
    const oldStr = oldVal instanceof Date ? oldVal.toISOString() : String(oldVal ?? '');
    const newStr = newVal instanceof Date ? newVal.toISOString() : String(newVal ?? '');
    if (oldStr !== newStr) {
      oldChanged[field] = oldVal;
      newChanged[field] = newVal;
    }
  }

  return { oldChanged, newChanged };
}

module.exports = { logActivity, computeDiff };
