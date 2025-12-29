import { Storage } from '@google-cloud/storage';
import { ENV } from './_core/env';

const storage = new Storage();
const bucket = storage.bucket(ENV.GCS_BUCKET_NAME);

export async function getSignedUrl(filePath: string): Promise<string> {
  const options = {
    version: 'v4' as const,
    action: 'read' as const,
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  const [url] = await bucket.file(filePath).getSignedUrl(options);
  return url;
}

export async function uploadFile(filePath: string, fileBuffer: Buffer): Promise<void> {
  const file = bucket.file(filePath);
  await file.save(fileBuffer);
}
