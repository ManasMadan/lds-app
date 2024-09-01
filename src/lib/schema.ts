import { Role } from "@prisma/client";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export const userRoles: [Role, ...Role[]] = [
  "NONE",
  "SME",
  "QC",
  "ADMIN",
] as const;

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(userRoles),
  teamId: z.string().optional(), // Add teamId as optional
});

export const editUserSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .union([
      z
        .string()
        .length(0, { message: "String must be either 0 char or min 8 char" }),
      z.string().min(8),
    ])
    .optional(),
  role: z
    .enum(userRoles, {
      invalid_type_error: "Invalid Role",
    })
    .default("NONE"),
  teamId: z.string().optional(), // Add teamId as optional
});
export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
});

export const editTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
});

import { Status } from "@prisma/client";

export const questionStatuses: [Status, ...Status[]] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
];

export type CreateUserFormInputs = z.infer<typeof signUpSchema>;
export type SignInFormInputs = z.infer<typeof signInSchema>;
export type EditUserFormInputs = z.infer<typeof editUserSchema>;
export type CreateTeamFormInputs = z.infer<typeof createTeamSchema>;
export type EditTeamFormInputs = z.infer<typeof editTeamSchema>;
