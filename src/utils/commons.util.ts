import { v4 as uuidv4 } from 'uuid';
import { v1 as uuidv1 } from 'uuid';

export default class GlobalUtil {
  /**
   * This routine compares two data items and returns true or false depending on whether or not they are the same.
   * @param pair1
   * @param pair2
   * @returns boolean
   */
  static areTheseTheSame(pair1: any, pair2: any): boolean {
    return pair1 === pair2;
  }

  static isFailure = (status: string): boolean => {
    return !(status == '00' || status == '03');
  };
  /**
   * This routine generates a uuid based on the version you pass to it as an argument. E.g. generateUUID(4) returns a uuid generated according to the uuidv4 standard.
   * @param version
   * @returns
   */
  static generateUUID(version: number = 1 | 4) {
    return version === 1 ? uuidv1() : uuidv4();
  }

  /**
   * Increases the numeric value of the given argument by raising it to the power of 7 to make the measure more eye-filling.
   * @param arg
   * @returns number
   */
  static exaggerate(arg: number): number {
    let exaggeration = Math.floor(Math.random() * arg);
    exaggeration = Math.pow(exaggeration, 2);
    return exaggeration;
  }
}
