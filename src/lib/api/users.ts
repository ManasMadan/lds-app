"use server";

import prisma from "@/lib/prisma";
import { CreateUserFormInputs, EditUserFormInputs } from "../schema";
import { Prisma, Role, User } from "@prisma/client";
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
  const user = await prisma.user.create({
    data: {
      email: inputs.email,
      name: inputs.name,
      password: hashed,
      role: inputs.role as Role,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.userDailyStats.create({
    data: {
      date: today,
      userId: user.id,
      role: user.role,
    },
  });

  return user;
}

export type SortField = "name" | "email" | "role" | "createdAt";
export type SortOrder = "asc" | "desc";

export async function getUsers({
  page = 1,
  perPage = 10,
  sortField = "createdAt",
  sortOrder = "desc",
  searchTerm = "",
  role,
}: {
  page?: number;
  perPage?: number;
  sortField?: SortField;
  sortOrder?: SortOrder;
  searchTerm?: string;
  role?: Role;
}) {
  const skip = (page - 1) * perPage;
  const take = perPage;

  const where: any = {};

  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (role) {
    where.role = role;
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    totalCount,
    totalPages: Math.ceil(totalCount / perPage),
  };
}

export async function deleteUsers(ids: string[]) {
  return await prisma.user.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
}

export async function updateUser(
  id: string,
  data: Partial<EditUserFormInputs>
) {
  const updateData: Prisma.UserUpdateInput = {
    name: data.name,
    email: data.email,
    role: data.role,
  };

  if (data.password && data.password.trim() !== "") {
    updateData.password = await hashPassword(data.password);
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
  });
}
