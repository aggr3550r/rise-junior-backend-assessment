import {
  SupportedImageExtension,
  SupportedVideoExtension,
} from '../enums/supported-extension.enum';

export const MAX_FILE_SIZE = '200mb';
export const MAX_ADMIN_REVIEW_COUNT = 3;

/**
 * Image extensions that our app can process.
 */
export const imageExtensions = [
  SupportedImageExtension.JPEG,
  SupportedImageExtension.PNG,
  SupportedImageExtension.SVG,
];

/**
 * Video extensions that our app can process.
 */
export const videoExtensions = [
  SupportedVideoExtension.AAC,
  SupportedVideoExtension.FLAC,
  SupportedVideoExtension.AVI,
  SupportedVideoExtension.MOV,
  SupportedVideoExtension.MKV,
  SupportedVideoExtension.WMV,
  SupportedVideoExtension.FLV,
  SupportedVideoExtension.MP3,
  SupportedVideoExtension.MPEG,
];
