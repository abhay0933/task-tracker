const path = require('path');
const fs = require('fs');
const prisma = require('../config/prisma');

async function uploadAttachment(req, res) {
  const { id: taskId } = req.params;

  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: req.user.userId },
    });
    if (!task) {
      // Clean up uploaded file if task not found
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        filename: req.file.originalname,
        filePath: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    return res.status(201).json({ attachment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function listAttachments(req, res) {
  const { id: taskId } = req.params;

  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: req.user.userId },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ attachments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { uploadAttachment, listAttachments };
