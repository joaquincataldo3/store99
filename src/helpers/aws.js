import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  credentials: {
    accessKeyId: bucketAccessKey,
    secretAccessKey: bucketSecretAccessKey,
  },
  region: bucketRegion,
});
const MODELS_BUCKET_NAME = 'models'

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
    const params = {
      Bucket: MODELS_BUCKET_NAME,
      Key: file.filename,
    };

    try {
      await s3.send(new DeleteObjectCommand(params));
      console.log(`✅ Archivo eliminado de S3: ${file.filename}`);
    } catch (error) {
      console.log(`❌ Error al eliminar ${file.filename}:`, error);
      return false;
    }
  }

  return true;

};