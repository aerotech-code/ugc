// File Upload Service (AWS S3 / MinIO)
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

export interface UploadOptions {
  bucket?: string;
  key: string;
  contentType?: string;
}

export interface FileMetadata {
  filename: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

const s3Client = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

export const fileService = {
  // Upload file to S3
  uploadToS3: async (filePath: string, options: UploadOptions): Promise<FileMetadata | null> => {
    try {
      const fileContent = await fs.readFile(filePath);
      const fileName = path.basename(filePath);
      const bucket = options.bucket || process.env.AWS_S3_BUCKET || 'chatapp-uploads';

      const params = {
        Bucket: bucket,
        Key: options.key || fileName,
        Body: fileContent,
        ContentType: options.contentType || 'application/octet-stream',
      };

      const result = await s3Client.upload(params).promise();

      const metadata: FileMetadata = {
        filename: fileName,
        size: fileContent.length,
        type: options.contentType || 'application/octet-stream',
        url: result.Location,
        uploadedAt: new Date(),
      };

      console.log(`File uploaded to S3: ${metadata.url}`);
      return metadata;
    } catch (error) {
      console.error('S3 upload error:', error);
      return null;
    }
  },

  // Delete file from S3
  deleteFromS3: async (key: string, bucket?: string): Promise<boolean> => {
    try {
      const params = {
        Bucket: bucket || process.env.AWS_S3_BUCKET || 'chatapp-uploads',
        Key: key,
      };

      await s3Client.deleteObject(params).promise();
      console.log(`File deleted from S3: ${key}`);
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      return false;
    }
  },

  // Generate signed URL for file download
  generateSignedUrl: (key: string, expiresIn: number = 3600, bucket?: string): string => {
    try {
      const params = {
        Bucket: bucket || process.env.AWS_S3_BUCKET || 'chatapp-uploads',
        Key: key,
        Expires: expiresIn,
      };

      const signedUrl = s3Client.getSignedUrl('getObject', params);
      console.log(`Signed URL generated for: ${key}`);
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return '';
    }
  }
};
