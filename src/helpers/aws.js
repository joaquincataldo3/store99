import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';
dotenv.config()
const BUCKET_REGION = "us-east-1"
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  },
  region: BUCKET_REGION,
});
const MODELS_BUCKET_NAME = 'store99-models'

export const uploadFile = async (fileBuffer, key, mimetype) => {
  const params = {
    Bucket: MODELS_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    console.log(`Archivo subido a S3: ${key}`);
    return key; 
  } catch (error) {
    console.error("Error al subir el archivo a S3:", error);
    throw error;
  }
};

export const deleteFilesFromS3 = async (files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const keysToDelete = [file.regular_filename, file.thumb_filename].filter(Boolean);

    for (const key of keysToDelete) {
      const params = {
        Bucket: MODELS_BUCKET_NAME,
        Key: key,
      };

      try {
        await s3.send(new DeleteObjectCommand(params));
        console.log(`✅ Archivo eliminado de S3: ${key}`);
      } catch (error) {
        console.log(`❌ Error al eliminar ${key}:`, error);
        return false;
      }
    }
  }

  return true;
};

export const getS3PublicUrl = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: MODELS_BUCKET_NAME,
      Key: key
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 }); 
    return url;
  } catch (err) {
    console.log("Error getting S3 signed URL", err);
    return null;
  }
};