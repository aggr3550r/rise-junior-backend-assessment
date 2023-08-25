import FilepathIncompleteException from '../exceptions/FilepathIncompleteException';
import { SupportedExtension } from '../enums/supported-extension.enum';
import UnsupportedFileFormatException from '../exceptions/UnsupportedFileFormatException';
import { CreateFileDTO } from '../modules/file/dtos/create-file.dto';
import fs from 'fs';
import logger from './logger.util';
import { AppError } from '../exceptions/AppError';
import path from 'path';

const log = logger.getLogger();

export default class FileUtil {
  static sanitizeFilePath(filePath: string) {
    try {
      const leadingForwardSlash = filePath[0];
      if (leadingForwardSlash !== '/') {
        throw new FilepathIncompleteException(
          'File path incomplete. Please add a leading forward slash to the filepath'
        );
      }

      // Perform standardization on filepath
      filePath = path.normalize(filePath);
      filePath = path.resolve(filePath);

      const parsedFilePath = filePath.split('/');
      const fileIndex = Number(parsedFilePath.length - 1);
      const fileName = parsedFilePath[fileIndex];

      const parsedFileName = fileName.split('.');

      if (parsedFileName.length < 2) {
        throw new FilepathIncompleteException();
      }

      const fileExtension = parsedFileName[1];

      if (!this.isSupportedFileExtension(fileExtension)) {
        throw new UnsupportedFileFormatException();
      }

      return {
        file_path: filePath,
        filename: fileName,
        extension: fileExtension,
      } as Partial<CreateFileDTO>;
    } catch (error) {
      log.error('parseFilePath', error);
    }
  }

  static computeFileSize(filePath: string) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      log.error('computeFileSize() error', error);
      return -1; // Indicate an error
    }
  }

  static readFileContent(filePath: string): Buffer {
    try {
      const fileContent = fs.readFileSync(filePath);
      return fileContent;
    } catch (error) {
      log.error('readFileContent() error', error);
      throw new AppError('Error reading file content', 400);
    }
  }

  private static isSupportedFileExtension(
    value: string
  ): value is SupportedExtension {
    return Object.values(SupportedExtension).includes(
      value as SupportedExtension
    );
  }
}
