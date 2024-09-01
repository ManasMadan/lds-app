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
      teamId: inputs.teamId || undefined,
    },
  });
  if (user.role === "ADMIN" || user.role === "NONE") return user;

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

export type SortField = "name" | "email" | "role" | "createdAt" | "teamId";
export type SortOrder = "asc" | "desc";

export async function getUsers({
  page = 1,
  perPage = 10,
  sortField = "createdAt",
  sortOrder = "desc",
  searchTerm = "",
  role,
  team,
}: {
  page?: number;
  perPage?: number;
  sortField?: SortField;
  sortOrder?: SortOrder;
  searchTerm?: string;
  role?: Role;
  team?: string;
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

  if (team) {
    where.teamId = team;
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { [sortField]: sortOrder },
      include: {
        team: true,
      },
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
  const prevUser = await prisma.user.findUnique({ where: { id } });
  if (!prevUser) {
    throw new Error("User not found");
  }
  const updateData: any = {
    name: data.name,
    email: data.email,
    role: data.role,
    teamId: data.teamId || undefined,
  };

  if (data.password && data.password.trim() !== "") {
    updateData.password = await hashPassword(data.password);
  }
  if (
    (prevUser.role === "ADMIN" || prevUser.role === "NONE") &&
    (data.role === "SME" || data.role === "QC")
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.userDailyStats.create({
      data: {
        date: today,
        userId: id,
        role: data.role,
      },
    });
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
  });
}
