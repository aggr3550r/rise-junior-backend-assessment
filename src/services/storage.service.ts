import AWS from 'aws-sdk';
import logger from '../utils/logger.util';
import { AppError } from '../exceptions/AppError';
import { UploadFileDTO } from '../modules/file/dtos/upload-file.dto';
import FileUtil from '../utils/file.util';

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

export class StorageService {
  async uploadFileToS3(data: UploadFileDTO) {
    try {
      // setup folder
      const folderName = data?.folder_name;
      const folderPath = folderName ? `uploads/${folderName}/` : 'uploads/';

      // setup file
      const fileName = data.filename;
      const filePath = data.file_path;

      const fileContent = FileUtil.readFileContent(filePath);

      const params = {
        Bucket: S3_BUCKET_NAME,
        Key: folderPath + fileName,
        Body: fileContent,
      };

      try {
        await s3.upload(params).promise();
        log.info(`File ${fileName} uploaded successfully.`);
      } catch (error) {
        log.error(`Error uploading ${fileName}:`, error);
      }
    } catch (error) {
      log.error('uploadFileToS3() error', error);
      throw new AppError('Error uploading file to S3 Bucket...', 400);
    }
  }

  async removeFileFromS3(fileName: string, folderName?: string) {
    try {
      const folderPath = folderName ? `uploads/${folderName}/` : 'uploads/';
      const params = {
        Bucket: S3_BUCKET_NAME,
        Key: folderPath + fileName,
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
}
