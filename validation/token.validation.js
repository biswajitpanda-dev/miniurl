import { z } from 'zod';

export const tokenValidation = z.object({
  id: z.string(),
});