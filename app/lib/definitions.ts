import { z } from "zod";

export const SignupFormSchema = z.object({
  orgName: z.string().min(2, { message: "Organization name must be at least 2 characters." }).trim(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long." })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { message: "Password is required." }),
});

export type SignupFormState =
  | { errors?: { orgName?: string[]; name?: string[]; email?: string[]; password?: string[] }; message?: string }
  | undefined;

export type LoginFormState =
  | { errors?: { email?: string[]; password?: string[] }; message?: string }
  | undefined;
