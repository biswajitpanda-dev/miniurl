import express from 'express';
import { db } from '../db/index.js';
import { userTable } from '../models/index.js';
import { eq } from 'drizzle-orm';
import { randomBytes, createHmac } from 'node:crypto';
import signupRequestBodySchema from '../validation/request.validation.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const validationResult = signupRequestBodySchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: validationResult.error.flatten(),
    });
  }

  const { firstName, lastName, email, password } = validationResult.data;
  const normalizedEmail = email.toLowerCase();

  const [existingUser] = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.email, normalizedEmail));

  if (existingUser) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const salt = randomBytes(64).toString('hex');
  const hashedPassword = createHmac('sha256', salt)
    .update(password)
    .digest('hex');

  const [user] = await db
    .insert(userTable)
    .values({
      email: normalizedEmail,
      firstName,
      lastName,
      salt,
      password: hashedPassword,
    })
    .returning({ id: userTable.id });

  return res.status(201).json({
    data: { userId: user.id },
  });
});

export default router;
