"use server";
import prisma from "@/lib/prisma";

export async function getSMEStatsData(smeId: string) {
  const now = new Date();
  const todayIST = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  todayIST.setUTCHours(18, 30, 0, 0);

  const yesterdayIST = new Date(todayIST);
  yesterdayIST.setDate(yesterdayIST.getDate() - 1);

  const firstDayOfMonth = new Date(
    todayIST.getFullYear(),
    todayIST.getMonth(),
    1
  );

  const totalQuestionsSubmitted = await prisma.question.count({
    where: {
      submittedById: smeId,
    },
  });

  const thisMonthQuestions = await prisma.question.count({
    where: {
      createdAt: {
        gte: firstDayOfMonth,
      },
      submittedById: smeId,
    },
  });

  const avgQuestionsPerDay = Math.round(
    thisMonthQuestions / todayIST.getDate()
  );

  const yesterdayStats = await prisma.userDailyStats.findFirst({
    where: {
      role: "SME",
      userId: smeId,
      date: yesterdayIST,
    },
  });

  return {
    totalQuestionsSubmitted,
    avgQuestionsPerDay,
    yesterdayStats: {
      pending: yesterdayStats?.questionsSubmitted || 0,
      approved: yesterdayStats?.questionsApproved || 0,
      rejected: yesterdayStats?.questionsRejected || 0,
    },
  };
}

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";

export async function fetchSMEStats(smeId: string) {
  const now = new Date();

  // Daily report (last 7 days)
  const dailyStats = await Promise.all(
    Array.from({ length: 7 }).map(async (_, i) => {
      const date = subDays(now, i);
      const stats = await prisma.userDailyStats.findUnique({
        where: {
          date_userId_role: {
            date: startOfDay(date),
            userId: smeId,
            role: "SME",
          },
        },
      });
      return {
        date: date.toISOString().split("T")[0],
        questionsSubmitted: stats?.questionsSubmitted || 0,
        questionsApproved: stats?.questionsApproved || 0,
        questionsRejected: stats?.questionsRejected || 0,
      };
    })
  );

  // Weekly report (last 4 weeks)
  const weeklyStats = await Promise.all(
    Array.from({ length: 4 }).map(async (_, i) => {
      const weekStart = startOfWeek(subWeeks(now, i));
      const weekEnd = endOfWeek(subWeeks(now, i));
      const stats = await prisma.userDailyStats.groupBy({
        by: ["userId"],
        where: {
          userId: smeId,
          role: "SME",
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        _sum: {
          questionsSubmitted: true,
          questionsApproved: true,
          questionsRejected: true,
        },
      });
      return {
        week: `Week ${i + 1}`,
        questionsSubmitted: stats[0]?._sum.questionsSubmitted || 0,
        questionsApproved: stats[0]?._sum.questionsApproved || 0,
        questionsRejected: stats[0]?._sum.questionsRejected || 0,
      };
    })
  );

  // Monthly report (last 6 months)
  const monthlyStats = await Promise.all(
    Array.from({ length: 6 }).map(async (_, i) => {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const stats = await prisma.userDailyStats.groupBy({
        by: ["userId"],
        where: {
          userId: smeId,
          role: "SME",
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          questionsSubmitted: true,
          questionsApproved: true,
          questionsRejected: true,
        },
      });
      return {
        month: monthStart.toLocaleString("default", { month: "long" }),
        questionsSubmitted: stats[0]?._sum.questionsSubmitted || 0,
        questionsApproved: stats[0]?._sum.questionsApproved || 0,
        questionsRejected: stats[0]?._sum.questionsRejected || 0,
      };
    })
  );

  // Overall SME performance
  const totalStats = await prisma.userDailyStats.groupBy({
    by: ["userId"],
    where: {
      userId: smeId,
      role: "SME",
    },
    _sum: {
      questionsSubmitted: true,
      questionsApproved: true,
      questionsRejected: true,
    },
  });

  const totalQuestionsSubmitted = totalStats[0]?._sum.questionsSubmitted || 0;
  const totalQuestionsApproved = totalStats[0]?._sum.questionsApproved || 0;
  const totalQuestionsRejected = totalStats[0]?._sum.questionsRejected || 0;

  const approvalRate =
    totalQuestionsSubmitted > 0
      ? totalQuestionsApproved / totalQuestionsSubmitted
      : 0;
  const rejectionRate =
    totalQuestionsSubmitted > 0
      ? totalQuestionsRejected / totalQuestionsSubmitted
      : 0;

  // Overall system statistics
  const systemStats = await prisma.question.groupBy({
    by: ["status"],
    _count: {
      _all: true,
    },
  });

  const totalSystemQuestions = systemStats.reduce(
    (acc, stat) => acc + stat._count._all,
    0
  );
  const systemApproved =
    systemStats.find((stat) => stat.status === "APPROVED")?._count._all || 0;
  const systemRejected =
    systemStats.find((stat) => stat.status === "REJECTED")?._count._all || 0;

  const systemApprovalRate =
    totalSystemQuestions > 0 ? systemApproved / totalSystemQuestions : 0;
  const systemRejectionRate =
    totalSystemQuestions > 0 ? systemRejected / totalSystemQuestions : 0;

  return {
    dailyStats,
    weeklyStats,
    monthlyStats,
    smePerformance: {
      totalQuestionsSubmitted,
      approvalRate,
      rejectionRate,
    },
    systemStats: {
      totalQuestionsSubmitted: totalSystemQuestions,
      approvalRate: systemApprovalRate,
      rejectionRate: systemRejectionRate,
    },
  };
}

export async function getQCHomePageStats(qcId: string) {
  const now = new Date();

  const todayIST = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  todayIST.setUTCHours(18, 30, 0, 0);

  const yesterdayIST = new Date(todayIST);
  yesterdayIST.setDate(yesterdayIST.getDate() - 1);

  const pendingReview = await prisma.question.count({
    where: {
      status: "PENDING",
    },
  });

  const reviewedToday = await prisma.userDailyStats.findFirst({
    where: {
      userId: qcId,
      date: todayIST,
    },
  });

  const yesterdayStats = await prisma.userDailyStats.findFirst({
    where: {
      role: "QC",
      userId: qcId,
      date: yesterdayIST,
    },
  });

  return {
    pendingReview,
    reviewedToday,
    yesterdayStats: {
      questionsReviewed: yesterdayStats?.questionsReviewed || 0,
      questionsApproved: yesterdayStats?.questionsApproved || 0,
      questionsRejected: yesterdayStats?.questionsRejected || 0,
    },
  };
}

export async function fetchQCStats(qcId: string) {
  const now = new Date();

  // Daily report (last 7 days)
  const dailyStats = await Promise.all(
    Array.from({ length: 7 }).map(async (_, i) => {
      const date = subDays(now, i);
      const stats = await prisma.userDailyStats.findUnique({
        where: {
          date_userId_role: {
            date: startOfDay(date),
            userId: qcId,
            role: "QC",
          },
        },
      });
      return {
        date: date.toISOString().split("T")[0],
        questionsReviewed: stats?.questionsReviewed || 0,
        questionsApproved: stats?.questionsApproved || 0,
        questionsRejected: stats?.questionsRejected || 0,
      };
    })
  );

  // Weekly report (last 4 weeks)
  const weeklyStats = await Promise.all(
    Array.from({ length: 4 }).map(async (_, i) => {
      const weekStart = startOfWeek(subWeeks(now, i));
      const weekEnd = endOfWeek(subWeeks(now, i));
      const stats = await prisma.userDailyStats.groupBy({
        by: ["userId"],
        where: {
          userId: qcId,
          role: "QC",
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        _sum: {
          questionsReviewed: true,
          questionsApproved: true,
          questionsRejected: true,
        },
      });
      return {
        week: `Week ${i + 1}`,
        questionsReviewed: stats[0]?._sum.questionsReviewed || 0,
        questionsApproved: stats[0]?._sum.questionsApproved || 0,
        questionsRejected: stats[0]?._sum.questionsRejected || 0,
      };
    })
  );

  // Monthly report (last 6 months)
  const monthlyStats = await Promise.all(
    Array.from({ length: 6 }).map(async (_, i) => {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const stats = await prisma.userDailyStats.groupBy({
        by: ["userId"],
        where: {
          userId: qcId,
          role: "QC",
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          questionsReviewed: true,
          questionsApproved: true,
          questionsRejected: true,
        },
      });
      return {
        month: monthStart.toLocaleString("default", { month: "long" }),
        questionsReviewed: stats[0]?._sum.questionsReviewed || 0,
        questionsApproved: stats[0]?._sum.questionsApproved || 0,
        questionsRejected: stats[0]?._sum.questionsRejected || 0,
      };
    })
  );

  // Overall QC performance
  const totalStats = await prisma.userDailyStats.groupBy({
    by: ["userId"],
    where: {
      userId: qcId,
      role: "QC",
    },
    _sum: {
      questionsReviewed: true,
      questionsApproved: true,
      questionsRejected: true,
    },
  });

  const totalQuestionsReviewed = totalStats[0]?._sum.questionsReviewed || 0;
  const totalQuestionsApproved = totalStats[0]?._sum.questionsApproved || 0;
  const totalQuestionsRejected = totalStats[0]?._sum.questionsRejected || 0;

  const approvalRate =
    totalQuestionsReviewed > 0
      ? totalQuestionsApproved / totalQuestionsReviewed
      : 0;
  const rejectionRate =
    totalQuestionsReviewed > 0
      ? totalQuestionsRejected / totalQuestionsReviewed
      : 0;

  // Overall system statistics
  const systemStats = await prisma.question.groupBy({
    by: ["status"],
    _count: {
      _all: true,
    },
  });

  const totalSystemQuestions = systemStats.reduce(
    (acc, stat) => acc + stat._count._all,
    0
  );
  const systemApproved =
    systemStats.find((stat) => stat.status === "APPROVED")?._count._all || 0;
  const systemRejected =
    systemStats.find((stat) => stat.status === "REJECTED")?._count._all || 0;

  const systemApprovalRate =
    totalSystemQuestions > 0 ? systemApproved / totalSystemQuestions : 0;
  const systemRejectionRate =
    totalSystemQuestions > 0 ? systemRejected / totalSystemQuestions : 0;

  return {
    dailyStats,
    weeklyStats,
    monthlyStats,
    qcPerformance: {
      totalQuestionsReviewed,
      approvalRate,
      rejectionRate,
    },
    systemStats: {
      totalQuestionsReviewed: totalSystemQuestions,
      approvalRate: systemApprovalRate,
      rejectionRate: systemRejectionRate,
    },
  };
}

export async function getAdminStatsData() {
  const now = new Date();
  const todayIST = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  todayIST.setUTCHours(18, 30, 0, 0);

  const totalUsers = await prisma.user.count();
  const totalQuestions = await prisma.question.count();
  const pendingTasks = await prisma.question.count({
    where: { status: "PENDING" },
  });

  const todayStats = await prisma.userDailyStats.groupBy({
    by: ["role"],
    where: {
      date: todayIST,
    },
    _sum: {
      questionsSubmitted: true,
      questionsApproved: true,
      questionsRejected: true,
      questionsReviewed: true,
    },
  });

  const todayStatsSum = todayStats.reduce(
    (acc, curr) => {
      acc.pending += curr._sum.questionsSubmitted || 0;
      acc.approved += curr._sum.questionsReviewed || 0;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 }
  );

  return {
    totalUsers,
    totalQuestions,
    pendingTasks,
    todayStats: todayStatsSum,
  };
}

export async function fetchAllSMEStats() {
  const now = new Date();

  // Daily report (last 7 days)
  const dailyStats = await Promise.all(
    Array.from({ length: 7 }).map(async (_, i) => {
      const date = subDays(now, i);
      const stats = await prisma.userDailyStats.groupBy({
        by: ["date"],
        where: {
          date: startOfDay(date),
          role: "SME",
        },
        _sum: {
          questionsSubmitted: true,
          questionsApproved: true,
          questionsRejected: true,
        },
      });
      return {
        date: date.toISOString().split("T")[0],
        questionsSubmitted: stats[0]?._sum.questionsSubmitted || 0,
        questionsApproved: stats[0]?._sum.questionsApproved || 0,
        questionsRejected: stats[0]?._sum.questionsRejected || 0,
      };
    })
  );

  // Weekly report (last 4 weeks)
  const weeklyStats = await Promise.all(
    Array.from({ length: 4 }).map(async (_, i) => {
      const weekStart = startOfWeek(subWeeks(now, i));
      const weekEnd = endOfWeek(subWeeks(now, i));
      const stats = await prisma.userDailyStats.groupBy({
        by: ["role"],
        where: {
          role: "SME",
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        _sum: {
          questionsSubmitted: true,
          questionsApproved: true,
          questionsRejected: true,
        },
      });
      return {
        week: `Week ${i + 1}`,
        questionsSubmitted: stats[0]?._sum.questionsSubmitted || 0,
        questionsApproved: stats[0]?._sum.questionsApproved || 0,
        questionsRejected: stats[0]?._sum.questionsRejected || 0,
      };
    })
  );

  // Monthly report (last 6 months)
  const monthlyStats = await Promise.all(
    Array.from({ length: 6 }).map(async (_, i) => {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const stats = await prisma.userDailyStats.groupBy({
        by: ["role"],
        where: {
          role: "SME",
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          questionsSubmitted: true,
          questionsApproved: true,
          questionsRejected: true,
        },
      });
      return {
        month: monthStart.toLocaleString("default", { month: "long" }),
        questionsSubmitted: stats[0]?._sum.questionsSubmitted || 0,
        questionsApproved: stats[0]?._sum.questionsApproved || 0,
        questionsRejected: stats[0]?._sum.questionsRejected || 0,
      };
    })
  );

  // Overall SME performance
  const totalStats = await prisma.userDailyStats.groupBy({
    by: ["role"],
    where: {
      role: "SME",
    },
    _sum: {
      questionsSubmitted: true,
      questionsApproved: true,
      questionsRejected: true,
    },
  });

  const totalQuestionsSubmitted = totalStats[0]?._sum.questionsSubmitted || 0;
  const totalQuestionsApproved = totalStats[0]?._sum.questionsApproved || 0;
  const totalQuestionsRejected = totalStats[0]?._sum.questionsRejected || 0;

  const averageApprovalRate =
    totalQuestionsSubmitted > 0
      ? totalQuestionsApproved / totalQuestionsSubmitted
      : 0;
  const averageRejectionRate =
    totalQuestionsSubmitted > 0
      ? totalQuestionsRejected / totalQuestionsSubmitted
      : 0;

  return {
    dailyStats,
    weeklyStats,
    monthlyStats,
    overallPerformance: {
      totalQuestionsSubmitted,
      averageApprovalRate,
      averageRejectionRate,
    },
  };
}

export async function fetchAllQCStats() {
  const now = new Date();

  // Daily report (last 7 days)
  const dailyStats = await Promise.all(
    Array.from({ length: 7 }).map(async (_, i) => {
      const date = subDays(now, i);
      const stats = await prisma.userDailyStats.groupBy({
        by: ["date"],
        where: {
          date: startOfDay(date),
          role: "QC",
        },
        _sum: {
          questionsReviewed: true,
          questionsApproved: true,
          questionsRejected: true,
        },
      });
      return {
        date: date.toISOString().split("T")[0],
        questionsReviewed: stats[0]?._sum.questionsReviewed || 0,
        questionsApproved: stats[0]?._sum.questionsApproved || 0,
        questionsRejected: stats[0]?._sum.questionsRejected || 0,
      };
    })
  );

  // Weekly report (last 4 weeks)
  const weeklyStats = await Promise.all(
    Array.from({ length: 4 }).map(async (_, i) => {
      const weekStart = startOfWeek(subWeeks(now, i));
      const weekEnd = endOfWeek(subWeeks(now, i));
      const stats = await prisma.userDailyStats.groupBy({
        by: ["role"],
        where: {
          role: "QC",
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        _sum: {
          questionsReviewed: true,
          questionsApproved: true,
          questionsRejected: true,
        },
      });
      return {
        week: `Week ${i + 1}`,
        questionsReviewed: stats[0]?._sum.questionsReviewed || 0,
        questionsApproved: stats[0]?._sum.questionsApproved || 0,
        questionsRejected: stats[0]?._sum.questionsRejected || 0,
      };
    })
  );

  // Monthly report (last 6 months)
  const monthlyStats = await Promise.all(
    Array.from({ length: 6 }).map(async (_, i) => {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const stats = await prisma.userDailyStats.groupBy({
        by: ["role"],
        where: {
          role: "QC",
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          questionsReviewed: true,
          questionsApproved: true,
          questionsRejected: true,
        },
      });
      return {
        month: monthStart.toLocaleString("default", { month: "long" }),
        questionsReviewed: stats[0]?._sum.questionsReviewed || 0,
        questionsApproved: stats[0]?._sum.questionsApproved || 0,
        questionsRejected: stats[0]?._sum.questionsRejected || 0,
      };
    })
  );

  // Overall QC performance
  const totalStats = await prisma.userDailyStats.groupBy({
    by: ["role"],
    where: {
      role: "QC",
    },
    _sum: {
      questionsReviewed: true,
      questionsApproved: true,
      questionsRejected: true,
    },
  });

  const totalQuestionsReviewed = totalStats[0]?._sum.questionsReviewed || 0;
  const totalQuestionsApproved = totalStats[0]?._sum.questionsApproved || 0;
  const totalQuestionsRejected = totalStats[0]?._sum.questionsRejected || 0;

  const averageApprovalRate =
    totalQuestionsReviewed > 0
      ? totalQuestionsApproved / totalQuestionsReviewed
      : 0;
  const averageRejectionRate =
    totalQuestionsReviewed > 0
      ? totalQuestionsRejected / totalQuestionsReviewed
      : 0;

  return {
    dailyStats,
    weeklyStats,
    monthlyStats,
    overallPerformance: {
      totalQuestionsReviewed,
      averageApprovalRate,
      averageRejectionRate,
    },
  };
}
export async function fetchOverallSystemStats() {
  const totalQuestionsSubmitted = await prisma.question.count();

  const questionStats = await prisma.question.groupBy({
    by: ["status"],
    _count: {
      _all: true,
    },
  });

  const approvedQuestions =
    questionStats.find((stat) => stat.status === "APPROVED")?._count._all || 0;
  const rejectedQuestions =
    questionStats.find((stat) => stat.status === "REJECTED")?._count._all || 0;

  const approvalRate =
    totalQuestionsSubmitted > 0
      ? approvedQuestions / totalQuestionsSubmitted
      : 0;
  const rejectionRate =
    totalQuestionsSubmitted > 0
      ? rejectedQuestions / totalQuestionsSubmitted
      : 0;

  // Top performers (SMEs)
  const topSMEs = await prisma.userDailyStats.groupBy({
    by: ["userId"],
    where: {
      role: "SME",
    },
    _sum: {
      questionsSubmitted: true,
    },
    orderBy: {
      _sum: {
        questionsSubmitted: "desc",
      },
    },
    take: 5,
  });

  // Top performers (QCs)
  const topQCs = await prisma.userDailyStats.groupBy({
    by: ["userId"],
    where: {
      role: "QC",
    },
    _sum: {
      questionsReviewed: true,
    },
    orderBy: {
      _sum: {
        questionsReviewed: "desc",
      },
    },
    take: 5,
  });

  // Fetch user names for top performers
  const topSMEsWithNames = await Promise.all(
    topSMEs.map(async (sme) => {
      const user = await prisma.user.findUnique({
        where: { id: sme.userId },
        select: { name: true, email: true, id: true },
      });
      return {
        name: user?.name || "Unknown",
        email: user?.email,
        id: user?.id,
        questionsSubmitted: sme._sum.questionsSubmitted || 0,
      };
    })
  );

  const topQCsWithNames = await Promise.all(
    topQCs.map(async (qc) => {
      const user = await prisma.user.findUnique({
        where: { id: qc.userId },
        select: { name: true, email: true, id: true },
      });
      return {
        name: user?.name || "Unknown",
        email: user?.email,
        id: user?.id,
        questionsReviewed: qc._sum.questionsReviewed || 0,
      };
    })
  );

  return {
    totalQuestionsSubmitted,
    approvalRate,
    rejectionRate,
    topPerformers: {
      sme: topSMEsWithNames,
      qc: topQCsWithNames,
    },
  };
}
