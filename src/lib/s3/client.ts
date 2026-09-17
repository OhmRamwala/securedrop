import { S3Client } from "@aws-sdk/client-s3";

function getEnv(key: string, altKey?: string): string {
  return process.env[key] || (altKey ? process.env[altKey] : "") || "";
}

export function isS3Configured(): boolean {
  const accessKeyId = getEnv("S3_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID");
  const secretAccessKey = getEnv("S3_SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY");
  const bucket = getEnv("S3_BUCKET", "AWS_S3_BUCKET");
  return Boolean(accessKeyId && secretAccessKey && bucket);
}

export const s3Bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || "securedrop-files";

export const s3Client = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || "us-east-1",
  credentials:
    (process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) &&
    (process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)
      ? {
          accessKeyId: (process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
          secretAccessKey: (process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
        }
      : undefined,
});
