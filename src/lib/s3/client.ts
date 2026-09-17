import { S3Client } from "@aws-sdk/client-s3";

function getEnv(key: string, altKey?: string): string {
  return process.env[key] || (altKey ? process.env[altKey] : "") || "";
}

export function getS3Region(): string {
  return getEnv("S3_REGION", "AWS_REGION") || "eu-north-1";
}

export function getS3Bucket(): string {
  return getEnv("S3_BUCKET", "AWS_S3_BUCKET") || "securedrop-college-prototype";
}

export function isS3Configured(): boolean {
  const accessKeyId = getEnv("S3_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID");
  const secretAccessKey = getEnv("S3_SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY");
  return Boolean(accessKeyId && secretAccessKey);
}

export function getS3Client(): S3Client {
  const accessKeyId = getEnv("S3_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID");
  const secretAccessKey = getEnv("S3_SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY");
  const region = getS3Region();

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "AWS S3 credentials not found. Ensure S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are set."
    );
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export const s3Bucket =
  process.env.S3_BUCKET ||
  process.env.AWS_S3_BUCKET ||
  "securedrop-college-prototype";

export const s3Client = new Proxy({} as S3Client, {
  get(_target, prop) {
    const client = getS3Client();
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});
