/**
 * This file contains an incomplete implementation of the ZIP file format
 * This is used to compress resource packs into ZIP files, to then send
 * through packets to clients. This way Serenity doesn't need to rely
 * on platform-specific command line tools, and the end user doesn't need
 * to provide resource packs pre-zipped, which is in line with vanilla's BDS.
 */

import { BinaryStream } from "@serenityjs/binarystream";
import { statSync, type Stats } from "fs";

interface CentralDirectoryFileHeader {
  version: number;
  minimumVersion: number;
  bitFlag: number;
  compressionMethod: number;
  lastModified: Date;
  crc32: number;
  compressedSize: number;
  uncompressedSize: number;
  diskNumber: number;
  internalFileAttributes: number;
  externalFileAttributes: number;
  fileHeaderOffset: number;
  fileName: string;
  extraField: Buffer;
  fileComment: string;
}

interface LocalFileHeader {
  minimumVersion: number;
  bitFlag: number;
  compressionMethod: number;
  lastModified: Date;
  crc32: number;
  compressedSize: number;
  uncompressedSize: number;
  fileName: string;
  extraField: Buffer;
}

interface EndOfCentralDirectory {
  diskNumber: number;
  startDiskNumber: number;
  diskEntried: number;
  totalEntries: number;
  centralDirectorySize: number;
  centralDirectoryOffset: number;
  comment: string;
}

interface CompressedFile {
  stats: Stats; // For modified time and original size
  compressionMethod: number;
  crc32: number;
  data: Buffer;
}

class Zip {
  private static readonly LOCAL_FILE_HEADER_SIG = 0x04_03_4b_50;
  private static readonly CENTRAL_DIRECTORY_FILE_HEADER_SIG = 0x02_01_4b_50;
  private static readonly END_OF_CENTRAL_DIRECTORY_SIG = 0x06_05_4b_50;

  private readonly stream = new BinaryStream();

  public constructor(public readonly dirPath: string) {
    if (!statSync(this.dirPath).isDirectory())
      throw new Error(`Zip: '${this.dirPath}': Path is not a directory.`);
  }

  /** Calculate the CRC-32 of a Buffer of data */
  private calculateCRC32(data: Buffer): number {
    const POLYNOMIAL = 0xed_b8_83_20;

    let crc = 0xff_ff_ff_ff;

    for (const byte of data) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) {
        const lsb = crc & 1;
        crc >>>= 1;
        if (lsb === 1) crc ^= POLYNOMIAL;
      }
    }

    return crc ^ 0xff_ff_ff_ff;
  }

  private readDirectory(
    path: string,
    relativePath: string,
    compress: boolean,
  ) {}
}
