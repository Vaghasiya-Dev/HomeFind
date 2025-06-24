
import { z } from 'zod';

export const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  location: z.string().min(2, { message: 'Location must be at least 2 characters.' }),
  bio: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
