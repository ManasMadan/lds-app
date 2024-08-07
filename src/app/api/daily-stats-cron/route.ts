export const maxDuration = 60;
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ["SME", "QC"] } },
    });
    const today = new Date();
    today.setUTCHours(18, 30, 0, 0);

    for (const user of users) {
      await prisma.userDailyStats.upsert({
        where: {
          date_userId_role: {
            date: today,
            userId: user.id,
            role: user.role,
          },
        },
        update: {},
        create: {
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
