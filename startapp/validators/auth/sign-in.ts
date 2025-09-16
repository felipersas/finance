import { strings } from '@/constants/Strings';
import { z } from 'zod';

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, { message: strings.validation.fieldRequired })
    .email(strings.validation.invalidEmail),
  password: z.string().min(6, { message: strings.validation.passwordMinLength }),
});

export type SignInData = z.infer<typeof SignInSchema>;