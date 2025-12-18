import express from 'express';
import { shortenPostRequestBodySchema } from '../validation/request.validation.js';
import { db } from '../db/index.js';
import { nanoid } from 'nanoid';
import { authenticationMiddleware } from '../middleware/auth.middleware.js';
import { urlTable } from '../models/index.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

/**
 * Create Short URL  (Protected)
 */
router.post('/shorten', authenticationMiddleware, async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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
      targetUrl: urlTable.targetUrl
    });

  return res.status(201).json(result);
});

/**
 * Redirect Short URL  (Public)
 */
router.get('/r/:code', async (req, res) => {
  const { code } = req.params;

  const [urlRecord] = await db
    .select({
      targetUrl: urlTable.targetUrl
    })
    .from(urlTable)
    .where(eq(urlTable.shortCode, code));

  if (!urlRecord) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  return res.redirect(urlRecord.targetUrl);
});

export default router;
