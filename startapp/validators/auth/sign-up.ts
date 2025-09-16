import { strings } from '@/constants/Strings';
import { z } from 'zod';

export const SignUpSchema = z.object({
  name: z.string()
    .min(1, { message: strings.validation.fieldRequired })
    .min(2, { message: "O nome deve ter no mínimo 2 caracteres" }),
  email: z
    .string()
    .min(1, { message: strings.validation.fieldRequired })
    .email(strings.validation.invalidEmail),
  password: z.string().min(6, { message: strings.validation.passwordMinLength }),
  confirmPassword: z.string().min(6, { message: strings.validation.passwordMinLength }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type SignUpData = z.infer<typeof SignUpSchema>;