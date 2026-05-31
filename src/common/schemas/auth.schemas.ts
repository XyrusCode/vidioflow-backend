import { z } from 'zod';

// Core auth schemas shared with FE come from @xyruscode/central.
export {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
} from '@xyruscode/central';

export type { LoginInput, RegisterInput, ForgotPasswordInput } from '@xyruscode/central';

// BE-only: ResetPassword includes a token field (FE uses confirmPassword instead).
export const ResetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'token is required' })
    .min(1, 'token must not be empty'),
  password: z
    .string({ required_error: 'password is required' })
    .min(6, 'password must be at least 6 characters')
    .max(72, 'password must be at most 72 characters'),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
