import { randomBytes, createHmac } from 'node:crypto';

export function hashPasswordWithSalt(password) {
  const salt = randomBytes(64).toString('hex');
  const hashedPassword = createHmac('sha256', salt)
    .update(password)
    .digest('hex');

  return { salt, password: hashedPassword };
}
