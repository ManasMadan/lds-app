"use server";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";
import { Status } from "@prisma/client";

export type SortField = "createdAt" | "status";
export type SortOrder = "asc" | "desc";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getQuestions({
  page = 1,
  perPage = 10,
  sortField = "createdAt",
  sortOrder = "desc",
  searchTerm = "",
  status,
  dateFrom,
  dateTo,
  submittedById,
  includeSmeInfo = false,
  reviewedById,
}: {
  page?: number;
  perPage?: number;
  sortField?: SortField;
  sortOrder?: SortOrder;
  searchTerm?: string;
  status?: Status;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  submittedById: string | undefined;
  includeSmeInfo?: boolean;
  reviewedById?: string;
}) {
  const skip = (page - 1) * perPage;
  const take = perPage;

  const where: any = {};

  if (searchTerm) {
    where.OR = [
      { reviewComment: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = dateFrom;
    }
    if (dateTo) {
      where.createdAt.lte = dateTo;
    }
  }

  if (submittedById) {
    where.submittedById = submittedById;
  }

  if (reviewedById) {
    where.reviewedById = reviewedById;
  }

  const [questions, totalCount] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take,
      orderBy: { [sortField]: sortOrder },
      include: includeSmeInfo
        ? {
            submittedBy: {
              select: {
                name: true,
                email: true,
              },
            },
          }
        : undefined,
    }),
    prisma.question.count({ where }),
  ]);

  return {
    questions,
    totalCount,
    totalPages: Math.ceil(totalCount / perPage),
  };
}

export async function deleteQuestions(ids: string[]) {
  const questionsToDelete = await prisma.question.findMany({
    where: {
      id: { in: ids },
      status: "PENDING",
    },
    select: {
      id: true,
      submittedById: true,
      imageS3Key: true,
    },
  });

  const s3DeletePromises = questionsToDelete.map(async (question) => {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: question.imageS3Key,
    });

    try {
      await s3Client.send(deleteCommand);
    } catch (error) {
      console.error(
        `Failed to delete S3 object for question ${question.id}:`,
        error
      );
    }
  });

  await Promise.all(s3DeletePromises);

  await prisma.question.deleteMany({
    where: {
      id: { in: ids },
      status: "PENDING",
    },
  });

  if (questionsToDelete.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const userId = questionsToDelete[0].submittedById;

    await prisma.userDailyStats.upsert({
      where: {
        date_userId_role: {
          date: today,
          userId: userId,
          role: "SME",
        },
      },
      update: {
        questionsSubmitted: { decrement: questionsToDelete.length },
      },
      create: {
        date: today,
        userId: userId,
        role: "SME",
        questionsSubmitted: -1 * questionsToDelete.length,
      },
    });
  }
}

export async function uploadQuestions(
  images: string[],
  userId: string
): Promise<string[]> {
  const uploadPromises = images.map(async (image, index) => {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const key = `questions/${userId}/${Date.now()}-${index}.jpg`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
    });
    await s3Client.send(command);
    const question = await prisma.question.create({
      data: {
        imageS3Key: key,
        submittedById: userId,
        status: "PENDING",
      },
    });
    return question.id;
  });

  const uploadedQuestionIds = await Promise.all(uploadPromises);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.userDailyStats.upsert({
    where: { date_userId_role: { date: today, userId: userId, role: "SME" } },
    update: {
      questionsSubmitted: { increment: images.length },
    },
    create: {
      date: today,
      userId: userId,
      role: "SME",
      questionsSubmitted: images.length,
    },
  });

  return uploadedQuestionIds;
}

export async function updateQuestionStatus(
  questionIds: string[],
  status: "APPROVED" | "REJECTED",
  reviewComment: string,
  reviewerId: string
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, submittedById: true, status: true },
  });

  const newUpdates = questions.filter(
    (question) => question.status === "PENDING"
  );

  const updatePromises = questions.map((question) =>
    prisma.question.update({
      where: { id: question.id },
      data: { status, reviewComment, reviewedById: reviewerId },
    })
  );

  await Promise.all(updatePromises);

  // Update QC stats
  await prisma.userDailyStats.upsert({
    where: {
      date_userId_role: {
        date: today,
        userId: reviewerId,
        role: "QC",
      },
    },
    update: {
      questionsReviewed: { increment: newUpdates.length },
      [status === "APPROVED" ? "questionsApproved" : "questionsRejected"]: {
        increment: newUpdates.length,
      },
    },
    create: {
      date: today,
      userId: reviewerId,
      role: "QC",
      questionsReviewed: newUpdates.length,
      [status === "APPROVED" ? "questionsApproved" : "questionsRejected"]:
        newUpdates.length,
    },
  });

  // Update SME stats
  for (const question of newUpdates) {
    if (question)
      await prisma.userDailyStats.upsert({
        where: {
          date_userId_role: {
            date: today,
            userId: question.submittedById,
            role: "SME",
          },
        },
        update: {
          [status === "APPROVED" ? "questionsApproved" : "questionsRejected"]: {
            increment: 1,
          },
        },
        create: {
          date: today,
          userId: question.submittedById,
          role: "SME",
          [status === "APPROVED"
            ? "questionsApproved"
            : "questionsRejected"]: 1,
        },
      });
  }
}

export async function getAdminQuestions({
  page = 1,
  perPage = 10,
  sortField = "createdAt",
  sortOrder = "desc",
  searchTerm = "",
  status,
  dateFrom,
  dateTo,
  submittedById,
  reviewedById,
}: {
  page?: number;
  perPage?: number;
  sortField?: SortField;
  sortOrder?: SortOrder;
  searchTerm?: string;
  status?: Status;
  dateFrom?: Date;
  dateTo?: Date;
  submittedById?: string;
  reviewedById?: string;
}) {
  const skip = (page - 1) * perPage;
  const take = perPage;

  const where: any = {};

  if (searchTerm) {
    where.OR = [
      { reviewComment: { contains: searchTerm, mode: "insensitive" } },
      { submittedBy: { name: { contains: searchTerm, mode: "insensitive" } } },
      { submittedBy: { email: { contains: searchTerm, mode: "insensitive" } } },
      { reviewedBy: { name: { contains: searchTerm, mode: "insensitive" } } },
      { reviewedBy: { email: { contains: searchTerm, mode: "insensitive" } } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = dateFrom;
    }
    if (dateTo) {
      where.createdAt.lte = dateTo;
    }
  }

  if (submittedById) {
    where.submittedById = submittedById;
  }

  if (reviewedById) {
    where.reviewedById = reviewedById;
  }

  const [questions, totalCount] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take,
      orderBy: { [sortField]: sortOrder },
      include: {
        submittedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.question.count({ where }),
  ]);

  return {
    questions,
    totalCount,
    totalPages: Math.ceil(totalCount / perPage),
  };
}
