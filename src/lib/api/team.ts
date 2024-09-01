"use server";

import prisma from "@/lib/prisma";
import { CreateTeamFormInputs } from "../schema";

export async function createTeam(inputs: CreateTeamFormInputs) {
  const team = await prisma.team.create({
    data: {
      name: inputs.name,
    },
  });
  return team;
}
export async function fetchTeams({
  page,
  perPage,
  sortField,
  sortOrder,
  searchTerm,
}: any) {
  const teams = await prisma.team.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
    orderBy: {
      [sortField]: sortOrder,
    },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  const totalTeams = await prisma.team.count({
    where: {
      name: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
  });

  return { teams, totalPages: Math.ceil(totalTeams / perPage) };
}

export async function deleteTeams(teamIds: string[]) {
  return await prisma.team.deleteMany({
    where: {
      id: {
        in: teamIds,
      },
    },
  });
}

export async function updateTeamName(teamId: string, newName: string) {
  return await prisma.team.update({
    where: { id: teamId },
    data: { name: newName },
  });
}
