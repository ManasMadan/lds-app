import { Role } from "@prisma/client";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export const userRoles: Role[] = ["NONE", "SME", "QC", "ADMIN"];

export const signUpSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z
    .enum(userRoles, {
      invalid_type_error: "Invalid Role",
    })
    .default("NONE"),
});

export type CreateUserFormInputs = z.infer<typeof signUpSchema>;
export type SignInFormInputs = z.infer<typeof signInSchema>;
