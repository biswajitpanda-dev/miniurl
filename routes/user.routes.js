import express from 'express'
import { db } from '../db/index'
import { userTable } from '../models/index'
import { eq } from 'drizzle-orm'
import { randomBytes, createHmac } from 'node:crypto'

const router = express.Router()

router.post('/signup', async (req, res)=>{
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const [existingUser] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, email));

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
        email,
        firstName,
        lastName,
        salt,
        password: hashedPassword,
      })
      .returning({ id: userTable.id });

    return res.status(201).json({ data: { userId: user.id } });

})

export default router