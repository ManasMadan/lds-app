"use server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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
    const mediaURL = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    const question = await prisma.question.create({
      data: {
        mediaURL,
        submittedById: userId,
        status: "PENDING",
      },
    });
    return question.id;
  });

  return Promise.all(uploadPromises);
}
