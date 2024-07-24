"use server";

import prisma from "@/lib/prisma";
import { CreateUserFormInputs } from "../schema";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";

async function hashPassword(plainPassword: string) {
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS!));
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}
export async function createUser(inputs: CreateUserFormInputs) {
  const hashed = await hashPassword(inputs.password);
  return prisma.user.create({
    data: {
      email: inputs.email,
      name: inputs.name,
      password: hashed,
      role: inputs.role as Role,
    },
  });
}
