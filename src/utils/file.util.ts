import fs from 'fs';
import logger from './logger.util';
import { AppError } from '../exceptions/AppError';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';

const log = logger.getLogger();

export default class FileUtil {
  static async compressImageBuffer(file: any) {
    try {
      const buffer: Buffer = file.buffer;
      console.log('*** Hold on, we are compressing your file ***');

      const compressedImageBuffer = await sharp(buffer)
        .resize({ width: 800 }) // Adjust the width as needed
        .toBuffer();

      console.log('*** Compression finished ***');

      return compressedImageBuffer;
    } catch (error) {
      log.error('compressImageFile() error', error);
      throw new AppError('Error compressing file.', 400);
    }
  }

  static async compressVideoBuffer(file: any) {
    return new Promise((resolve, reject) => {
      console.log('*** Hold on, we are compressing your file ***');

      const buffer = file.buffer;
      const ext = file.originalname.split('.')[1];

      let outputBuffer: Buffer = Buffer.alloc(0);

      const readableStream = Readable.from([buffer]);

      ffmpeg()
        .input(readableStream)
        .inputFormat(ext)
        .outputOptions(['-c:v libx264', '-crf 28'])
        .toFormat('mp4')
        .on('data', (chunk: any) => {
          outputBuffer = Buffer.concat([outputBuffer, chunk]);
        })
        .on('end', () => {
          console.log('*** Compression finished ***');
          resolve(outputBuffer);
        })
        .on('error', (err: Error) => {
          console.error('Error during compression:', err);
          reject(err);
        })
        .run();
    });
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
}
