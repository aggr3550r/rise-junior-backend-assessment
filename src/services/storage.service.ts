import AWS from 'aws-sdk';
import logger from '../utils/logger.util';
import { AppError } from '../exceptions/AppError';
import { UploadFileDTO } from '../modules/file/dtos/upload-file.dto';
import FileUtil from '../utils/file.util';
import { imageExtensions, videoExtensions } from '../types/constant.types';

const log = logger.getLogger();

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME } =
  process.env;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

// Create S3 instance
const s3 = new AWS.S3();

export default class StorageService {
  async uploadFileToS3(data: UploadFileDTO, file: any) {
    try {
      const fileKey = file.originalname;
      const fileExt = fileKey.split('.')[1];
      let compressedBuffer;

      if (imageExtensions.includes(fileExt)) {
        compressedBuffer = await FileUtil.compressImageBuffer(file.buffer);
      } else if (videoExtensions.includes(fileExt)) {
        compressedBuffer = await FileUtil.compressVideoBuffer(file.buffer);
      }

      const params = {
        Bucket: S3_BUCKET_NAME,
        Key: fileKey,
        Body: compressedBuffer,
        ContentType: file.mimetype,
      };

      try {
        await s3.upload(params).promise();
        log.info(`File ${data.filename} uploaded successfully.`);
        return fileKey;
      } catch (error) {
        log.error(`Error uploading ${data.filename}:`, error);
        return;
      }
    } catch (error) {
      log.error('uploadFileToS3() error', error);
      throw new AppError('Error uploading file to S3 Bucket...', 400);
    }
  }

  async removeFileFromS3(fileName: string, folderName?: string) {
    try {
      const data: Partial<UploadFileDTO> = {
        filename: fileName,
        folder_name: folderName,
      };

      const fileKey = this.constructS3FileKey(data);
      const params = {
        Bucket: S3_BUCKET_NAME,
        Key: fileKey,
      };

      try {
        await s3.deleteObject(params).promise();
        log.info(`File ${fileName} removed from S3 bucket.`);
      } catch (error) {
        log.error(`Error removing ${fileName} from S3 bucket:`, error);
      }
    } catch (error) {
      log.error('removeFileFromS3() error', error);
      throw new AppError('Error removing file from S3 Bucket...', 400);
    }
  }

  async getDownloadUrl(fileKey: string) {
    try {
      const params = {
        Bucket: S3_BUCKET_NAME,
        Key: fileKey,
      };

      const url = s3.getSignedUrl('getObject', params);
      return url;
    } catch (error) {
      log.error('getDownloadUrl() error', error);
      throw new AppError('Error generating dowload URL', 400);
    }
  }

  /**
   * This concatenates the optional user chosen folder name to the user chosen file name according to the requirements of the specific S3 bucket
   */
  private constructS3FileKey(data: Partial<UploadFileDTO>) {
    const folderName = data?.folder_name;
    const folderPath = folderName ? `uploads/${folderName}/` : 'uploads/';

    const fileName = data.filename;

    const fileKey = folderPath + fileName;
    return fileKey;
  }
}
