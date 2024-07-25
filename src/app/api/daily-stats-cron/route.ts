import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ["SME", "QC"] } },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of users) {
      await prisma.userDailyStats.create({
        data: {
          date: today,
          userId: user.id,
          role: user.role,
        },
      });
    }

    return Response.json({ message: "Daily stats created successfully" });
  } catch (error) {
    console.error("Error creating daily stats:", error);
    return Response.json(
      { error: "Failed to create daily stats" },
      { status: 500 }
    );
  }
}
