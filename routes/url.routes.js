import express from 'express';
import { shortenPostRequestBodySchema } from '../validation/request.validation.js';
import { db } from '../db/index.js';
import { nanoid } from 'nanoid';
import { authenticationMiddleware } from '../middleware/auth.middleware.js';
import { urlTable } from '../models/index.js';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

// Create Short URL (PROTECTED),  POST /shorten

router.post('/shorten', authenticationMiddleware, async (req, res) => {
  const userId = req.user.id;

  const validationResult = await shortenPostRequestBodySchema.safeParseAsync(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.flatten() });
  }

  const { url, code } = validationResult.data;
  const shortCode = code ?? nanoid(6);

  const [result] = await db
    .insert(urlTable)
    .values({
      shortCode,
      targetUrl: url,
      userId,
    })
    .returning({
      id: urlTable.id,
      shortCode: urlTable.shortCode,
      targetUrl: urlTable.targetUrl,
      createdAt: urlTable.createdAt
    });

  return res.status(201).json(result);
});

// Get All URLs of Logged-In User (PROTECTED), GET /urls
router.get('/urls', authenticationMiddleware, async (req, res) => {
  const userId = req.user.id;

  const urls = await db
    .select({
      id: urlTable.id,
      shortCode: urlTable.shortCode,
      targetUrl: urlTable.targetUrl,
      createdAt: urlTable.createdAt
    })
    .from(urlTable)
    .where(eq(urlTable.userId, userId));

  return res.json({ urls });
});

// Delete URL (Only If Owned By User) (PROTECTED), DELETE /urls/:id
router.delete('/urls/:id', authenticationMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  // Check if URL exists
  const [url] = await db
    .select({
      userId: urlTable.userId
    })
    .from(urlTable)
    .where(eq(urlTable.id, id));

  if (!url) {
    return res.status(404).json({ error: 'URL not found' });
  }

  // Check if belongs to user
  if (url.userId !== userId) {
    return res.status(403).json({ error: 'Not allowed to delete this URL' });
  }

  await db.delete(urlTable).where(eq(urlTable.id, id));

  return res.json({ message: 'URL deleted successfully' });
});

// Redirect to Original URL (PUBLIC), GET /:shortCode
router.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  const [urlRecord] = await db
    .select({
      targetUrl: urlTable.targetUrl
    })
    .from(urlTable)
    .where(eq(urlTable.shortCode, shortCode));

  if (!urlRecord) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  return res.redirect(urlRecord.targetUrl);
});
export default router;
