import { z } from 'zod';

const signupRequestBodySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

export default signupRequestBodySchema;
