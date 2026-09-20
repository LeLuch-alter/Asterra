import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
