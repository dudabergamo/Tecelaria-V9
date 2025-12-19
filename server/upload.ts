
import express from 'express';
import multer from 'multer';
import { uploadToGCS } from './gcs';
import { randomUUID } from 'crypto';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const userId = req.body.userId;
  if (!userId) {
    return res.status(400).send('User ID is required.');
  }

  const memoryId = req.body.memoryId;
  if (!memoryId) {
    return res.status(400).send('Memory ID is required.');
  }

  const fileExtension = req.file.originalname.split('.').pop();
  const fileName = `${userId}/${memoryId}/${randomUUID()}.${fileExtension}`;

  try {
    const fileUrl = await uploadToGCS(req.file.buffer, fileName);
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    res.status(500).send('Error uploading file.');
  }
});

export default router;
