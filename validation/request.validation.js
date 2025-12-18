import { optional, z } from 'zod';

export const signupRequestBodySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginRequestBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const shortenPostRequestBodySchema = z.object({
  url: z.string().url(),
  code: z.string().optional()

})