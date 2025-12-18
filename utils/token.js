import jwt from 'jsonwebtoken';
import { tokenValidation } from '../validation/token.validation.js'


const JWT_SECRET = process.env.JWT_SECRET;

export async function createUserToken(payload) {
  const validationResult = await tokenValidation.safeParseAsync(payload);

  if (!validationResult.success) {
    throw new Error(validationResult.error.message);
  }

  const validatedData = validationResult.data;

  const token = jwt.sign(validatedData, JWT_SECRET,);

  return token;
}

export function validateUserToken(token){
  const payload = jwt.verify(token, JWT_SECRET)
  return payload
}