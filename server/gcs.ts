
import { Storage } from '@google-cloud/storage';

const storage = new Storage();

const bucketName = process.env.GCS_BUCKET_NAME!;

export const uploadToGCS = async (filePath: string, destFileName: string) => {
  await storage.bucket(bucketName).upload(filePath, {
    destination: destFileName,
  });

  return `https://storage.googleapis.com/${bucketName}/${destFileName}`;
};
