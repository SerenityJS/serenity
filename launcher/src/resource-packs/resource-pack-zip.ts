import { type Stats, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { deflateRawSync } from "node:zlib";

import { BinaryStream, Endianness } from "@serenityjs/binarystream";

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
	diskEntries: number;
	totalEntries: number;
	centralDirectorySize: number;
	centralDirectoryOffset: number;
	comment: string;
}

interface CompressedFile {
	stats: Stats; // for modified time and original size
	compressionMethod: number;
	crc32: number;
	data: Buffer;
}

/**
 * Compresses a standard ZIP file out of a given folder path.
 */
class ResourcePackZip {
	private static readonly LOCAL_FILE_HEADER_SIG = 0x04_03_4b_50;
	private static readonly CENTRAL_DIRECTORY_FILE_HEADER_SIG = 0x02_01_4b_50;
	private static readonly END_OF_CENTRAL_DIRECTORY_SIG = 0x06_05_4b_50;

	private readonly stream = new BinaryStream();

	public constructor(public readonly packPath: string) {
		// Check if the path is a directory
		if (!statSync(this.packPath).isDirectory())
			throw new Error(`'${this.packPath}': Path is not a directory.`);
	}

	/** Function to calculate the CRC-32 of a buffer. */
	private calculateCrc32(data: Buffer): number {
		let crc = 0xff_ff_ff_ff;

		for (const byte of data) {
			crc = crc ^ byte;

			for (let index = 0; index < 8; index++) {
				crc = (crc & 1) === 1 ? (crc >>> 1) ^ 0xed_b8_83_20 : crc >>> 1;
			}
		}

		return crc ^ 0xff_ff_ff_ff;
	}

	/**
	 * Recursively traverse a folder's subdirectories and compress the files.
	 * Also calculates CRC-32 for each file, and returns data needed to create the zip file.
	 */
	private readDirectory(path: string, relativePath: string, compress: boolean) {
		// Create a map to store the files. Key is the relative path, value is data needed to create the zip.
		const files = new Map<string, CompressedFile>();

		// Iterate over all items in the directory.
		const directory = readdirSync(path);
		for (const item of directory) {
			const itemPath = join(path, item);
			const itemStats = statSync(itemPath);

			if (itemStats.isDirectory()) {
				// Recursively call the function to read the subdirectory.
				const subItems = this.readDirectory(
					itemPath,
					relativePath.length === 0 ? item : relativePath + "/" + item,
					compress
				);

				// Add the items from the subdirectory to the files map.
				for (const [subItemPath, subItem] of subItems.entries())
					files.set(subItemPath, subItem);
			} else {
				// Read the file data and compress it using deflate.
				// Use compressed data if it is smaller than the original file.
				// This isn't ideal, but it should work fine for resource packs.
				const fileData = readFileSync(itemPath);
				const compressedData = deflateRawSync(fileData);
				const useCompressed =
					compress && compressedData.length < fileData.length;

				files.set(
					relativePath.length === 0 ? item : relativePath + "/" + item,
					{
						stats: itemStats,
						data: useCompressed ? compressedData : fileData,
						crc32: this.calculateCrc32(fileData),
						compressionMethod: useCompressed ? 8 : 0
					}
				);
			}
		}

		return files;
	}

	/**
	 * Writes a local file header to the zip file.
	 */
	private writeLocalFileHeader(header: LocalFileHeader): void {
		// Local file header signature
		this.stream.writeUint32(
			ResourcePackZip.LOCAL_FILE_HEADER_SIG,
			Endianness.Little
		);

		this.stream.writeShort(header.minimumVersion, Endianness.Little);
		this.stream.writeShort(header.bitFlag, Endianness.Little);
		this.stream.writeShort(header.compressionMethod, Endianness.Little);

		// Last modified related fields, conversion from Date object to DOS date and time
		this.stream.writeUShort(
			((header.lastModified.getSeconds() / 2) & 0x1f) |
				((header.lastModified.getMinutes() & 0x3f) << 5) |
				((header.lastModified.getHours() & 0x1f) << 11),
			Endianness.Little
		);
		this.stream.writeUShort(
			(header.lastModified.getDate() & 0x1f) |
				(((header.lastModified.getMonth() + 1) & 0x0f) << 5) |
				((header.lastModified.getFullYear() - 1980) << 9),
			Endianness.Little
		);

		this.stream.writeInt32(header.crc32, Endianness.Little);
		this.stream.writeUint32(header.compressedSize, Endianness.Little);
		this.stream.writeUint32(header.uncompressedSize, Endianness.Little);

		// Convert file name to UTF-8 buffer.
		const fileNameBuffer = Buffer.from(header.fileName, "utf8");

		this.stream.writeShort(fileNameBuffer.length, Endianness.Little);
		this.stream.writeShort(header.extraField.length, Endianness.Little);

		this.stream.writeBuffer(fileNameBuffer);
		this.stream.writeBuffer(header.extraField);

		// Increment the offset as BinaryStream doesn't do this automatically on write, only on read.
		this.stream.offset += 30 + fileNameBuffer.length + header.extraField.length;
	}

	/**
	 * Writes a central directory file header to the zip file.
	 */
	private writeCentralDirectoryFileHeader(
		header: CentralDirectoryFileHeader
	): void {
		// Central directory file header signature
		this.stream.writeUint32(
			ResourcePackZip.CENTRAL_DIRECTORY_FILE_HEADER_SIG,
			Endianness.Little
		);

		this.stream.writeShort(header.version, Endianness.Little);
		this.stream.writeShort(header.minimumVersion, Endianness.Little);
		this.stream.writeShort(header.bitFlag, Endianness.Little);
		this.stream.writeShort(header.compressionMethod, Endianness.Little);

		// Last modified related fields, conversion from Date object to DOS date and time
		this.stream.writeUShort(
			((header.lastModified.getSeconds() / 2) & 0x1f) |
				((header.lastModified.getMinutes() & 0x3f) << 5) |
				((header.lastModified.getHours() & 0x1f) << 11),
			Endianness.Little
		);
		this.stream.writeUShort(
			(header.lastModified.getDate() & 0x1f) |
				(((header.lastModified.getMonth() + 1) & 0x0f) << 5) |
				((header.lastModified.getFullYear() - 1980) << 9),
			Endianness.Little
		);

		this.stream.writeInt32(header.crc32, Endianness.Little);
		this.stream.writeUint32(header.compressedSize, Endianness.Little);
		this.stream.writeUint32(header.uncompressedSize, Endianness.Little);

		const fileNameBuffer = Buffer.from(header.fileName, "utf8");
		const fileCommentBuffer = Buffer.from(header.fileComment, "utf8");

		this.stream.writeShort(fileNameBuffer.length, Endianness.Little);
		this.stream.writeShort(header.extraField.length, Endianness.Little);
		this.stream.writeShort(fileCommentBuffer.length, Endianness.Little);

		this.stream.writeShort(header.diskNumber, Endianness.Little);
		this.stream.writeShort(header.internalFileAttributes, Endianness.Little);
		this.stream.writeUint32(header.externalFileAttributes, Endianness.Little);
		this.stream.writeUint32(header.fileHeaderOffset, Endianness.Little);

		this.stream.writeBuffer(fileNameBuffer);
		this.stream.writeBuffer(header.extraField);
		this.stream.writeBuffer(fileCommentBuffer);

		// Increment the offset as BinaryStream doesn't do this automatically on write, only on read.
		this.stream.offset +=
			46 +
			fileNameBuffer.length +
			header.extraField.length +
			fileCommentBuffer.length;
	}

	/**
	 * Writes the end of central directory to the zip file.
	 */
	private writeEndOfCentralDirectory(eocd: EndOfCentralDirectory): void {
		// End of central directory signature
		this.stream.writeUint32(
			ResourcePackZip.END_OF_CENTRAL_DIRECTORY_SIG,
			Endianness.Little
		);

		this.stream.writeShort(eocd.diskNumber, Endianness.Little);
		this.stream.writeShort(eocd.startDiskNumber, Endianness.Little);
		this.stream.writeShort(eocd.diskEntries, Endianness.Little);
		this.stream.writeShort(eocd.totalEntries, Endianness.Little);
		this.stream.writeUint32(eocd.centralDirectorySize, Endianness.Little);
		this.stream.writeUint32(eocd.centralDirectoryOffset, Endianness.Little);

		const commentBuffer = Buffer.from(eocd.comment, "utf8");

		this.stream.writeShort(commentBuffer.length, Endianness.Little);
		this.stream.writeBuffer(commentBuffer);

		// Increment the offset as BinaryStream doesn't do this automatically on write, only on read.
		this.stream.offset += 22 + commentBuffer.length;
	}

	/**
	 * Compresses the pack and returns the buffer.
	 */
	public compressPack(): { data: Buffer; originalSize: bigint } {
		// Read all the files in the root directory.
		const files = this.readDirectory(this.packPath, "", true);

		// Store the central directory headers to write later.
		const centralDirectoryFileHeaders: Array<CentralDirectoryFileHeader> = [];

		// Calculate the original size of the pack
		let originalSize = 0n;

		for (const [relativePath, file] of files.entries()) {
			originalSize += BigInt(file.stats.size);

			const localFileHeader: LocalFileHeader = {
				minimumVersion: 20,
				bitFlag: 0,
				compressionMethod: file.compressionMethod,
				lastModified: file.stats.mtime,
				crc32: file.crc32,
				compressedSize: file.data.length,
				uncompressedSize: file.stats.size,
				fileName: relativePath,
				extraField: Buffer.alloc(0)
			};

			const centralDirectoryFileHeader: CentralDirectoryFileHeader = {
				version: 20,
				minimumVersion: 20,
				bitFlag: 0,
				compressionMethod: file.compressionMethod,
				lastModified: file.stats.mtime,
				crc32: file.crc32,
				compressedSize: file.data.length,
				uncompressedSize: file.stats.size,
				diskNumber: 0,
				internalFileAttributes: 0,
				externalFileAttributes: 0,
				fileHeaderOffset: this.stream.offset,
				fileName: relativePath,
				extraField: Buffer.alloc(0),
				fileComment: ""
			};

			centralDirectoryFileHeaders.push(centralDirectoryFileHeader);

			this.writeLocalFileHeader(localFileHeader);

			this.stream.writeBuffer(file.data);
			this.stream.offset += file.data.byteLength;
		}

		const centralDirectoryOffset = this.stream.offset;

		for (const header of centralDirectoryFileHeaders)
			this.writeCentralDirectoryFileHeader(header);

		const endOfCentralDirectory: EndOfCentralDirectory = {
			diskNumber: 0,
			startDiskNumber: 0,
			diskEntries: files.size,
			totalEntries: files.size,
			centralDirectorySize: this.stream.offset - centralDirectoryOffset,
			centralDirectoryOffset: centralDirectoryOffset,
			comment: ""
		};

		this.writeEndOfCentralDirectory(endOfCentralDirectory);

		return { data: this.stream.getBuffer(), originalSize };
	}

	public getPackSize(): bigint {
		const files = this.readDirectory(this.packPath, "", false);

		let size = 0n;
		for (const file of files.values()) size += BigInt(file.data.byteLength);

		return size;
	}
}

export { ResourcePackZip };
