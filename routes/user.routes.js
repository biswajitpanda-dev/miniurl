import express from 'express';
import {
  signupRequestBodySchema,
  loginRequestBodySchema,
} from '../validation/request.validation.js';
import { hashPasswordWithSalt } from '../utils/hash.js';
import { getUserByEmail, createUser } from '../services/user.services.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const validationResult = signupRequestBodySchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: validationResult.error.flatten(),
    });
  }

  const { firstName, lastName, email, password } = validationResult.data;

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const { salt, password: hashedPassword } =
    hashPasswordWithSalt(password);

  const user = await createUser({
    email,
    firstName,
    lastName,
    password: hashedPassword,
    salt,
  });

  return res.status(201).json({
    data: { userId: user.id },
  });
});

router.post('/login', async (req, res) => {
  const validationResult = loginRequestBodySchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: validationResult.error.flatten(),
    });
  }

  const { email, password } = validationResult.data;

  const user = await getUserByEmail(email);

  if (!user) {
    return res.status(404).json({ error: 'User does not exist' });
  }

  const { password: hashedPassword } =
    hashPasswordWithSalt(password, user.salt);

  if (user.password !== hashedPassword) {
    return res.status(400).json({ error: 'Incorrect password' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT secret not configured' });
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({ token });
});

export default router;
