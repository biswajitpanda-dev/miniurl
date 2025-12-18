import { db } from '../db/index.js';
import { userTable } from '../models/index.js';
import { eq } from 'drizzle-orm';

export async function getUserByEmail(email) {
  const normalizedEmail = email.toLowerCase();

  const [user] = await db
    .select({
      id: userTable.id,
      firstName: userTable.firstName,
      lastName: userTable.lastName,
      email: userTable.email,
      salt: userTable.salt,
      password: userTable.password
    })
    .from(userTable)
    .where(eq(userTable.email, normalizedEmail));

  return user;
}

export async function createUser({
  email,
  firstName,
  lastName,
  password,
  salt,
}) {
  const [user] = await db
    .insert(userTable)
    .values({
      email: email.toLowerCase(),
      firstName,
      lastName,
      password,
      salt,
    })
    .returning({ id: userTable.id });

  return user;
}
