import { createHash } from "node:crypto";

import { zipSync } from "fflate";
import { ResourcePackDescriptor } from "@serenityjs/protocol";

import { ResourceManifest } from "../types";

import { FileMap } from "./resources";

class ResourcePack {
  /**
   * The information about the resource pack.
   */
  public static packInformation: string =
    "This resource pack was downloaded from a SerenityJS server.\nFor more information, visit https://serenityjs.net";

  /**
   * The path to the main directory of the resource pack.
   */
  public readonly path: string;

  /**
   * The manifest of the resource pack.
   */
  public readonly manifest: ResourceManifest;

  /**
   * The file contents of the resource pack.
   */
  public readonly fileTree: FileMap<Buffer | FileMap>;

  /**
   * The buffer cache for the resource pack.
   */
  private cache = Buffer.alloc(0);

  /**
   * Create a new resource pack instance.
   * @param path The path to the resource pack.
   * @param manifest The manifest of the resource pack.
   * @param fileTree The file contents of the resource pack.
   */
  public constructor(
    path: string,
    manifest: ResourceManifest,
    fileTree?: FileMap<Buffer | FileMap>
  ) {
    // Assign the path and manifest
    this.path = path;
    this.manifest = manifest;

    // If the file tree is not provided, create an empty object
    this.fileTree = fileTree ?? {};

    // Set the pack information file in the file tree
    this.setFile("serenityjs", Buffer.from(ResourcePack.packInformation));
  }

  /**
   * The name of the resource pack.
   */
  public get name(): string {
    return this.manifest.header.name;
  }

  /**
   * The UUID of the resource pack.
   */
  public get uuid(): string {
    return this.manifest.header.uuid.toLowerCase();
  }

  /**
   * The version of the resource pack.
   */
  public get version(): string {
    return typeof this.manifest.header.version === "string"
      ? this.manifest.header.version
      : this.manifest.header.version.join(".");
  }

  /**
   * Whether the resource pack has raytracing capabilities.
   */
  public get isRtx(): boolean {
    return this.manifest.capabilities?.includes("raytraced") ?? false;
  }

  /**
   * Get a file from the resource pack.
   * @param path The path to the file.
   * @returns The file contents as a Buffer.
   */
  public getFile(path: string): Buffer {
    // Check if the file exists in the file tree
    if (this.fileTree[path]) {
      // Return the file contents
      return this.fileTree[path] as Buffer;
    } else {
      // If the file doesn't exist, throw an error
      throw new Error(`File ${path} not found in resource pack.`);
    }
  }

  /**
   * Set a file in the resource pack.
   * @param path The path to the file.
   * @param data The file contents as a Buffer.
   */
  public setFile(path: string, data: Buffer): void {
    // Set the file contents in the file tree
    this.fileTree[path] = data;
  }

  /**
   * Delete a file from the resource pack.
   * @param path The path to the file.
   */
  public deleteFile(path: string): void {
    // Check if the file exists in the file tree
    if (this.fileTree[path]) {
      // Delete the file from the file tree
      delete this.fileTree[path];
    } else {
      // If the file doesn't exist, throw an error
      throw new Error(`File ${path} not found in resource pack.`);
    }
  }

  /**
   * Compress the resource pack into a zip file.
   * @returns The compressed zip file as a Buffer.
   */
  public compress(): Buffer {
    // Check if the cache is empty
    if (this.cache.length > 0) return this.cache;

    // Compress the file tree into a zip file
    const buffer = Buffer.from(zipSync(this.fileTree, { level: 9 }));

    // Store the compressed data in the cache
    this.cache = buffer;

    // Return the compressed zip file
    return buffer;
  }

  /**
   * Get the amount of chunks that need to be sent to the client for this pack.
   * @param maxChunkSize The maximum size of a chunk in bytes.
   * @returns The number of chunks.
   */
  public getChunkCount(maxChunkSize: number): number {
    // Check if the cache is empty
    if (this.cache.length === 0) this.compress();

    // Calculate the number of chunks based on the size of the compressed data
    return Math.ceil(this.cache.byteLength / maxChunkSize);
  }

  /**
   * Get the chunk data for a specific index.
   * @param index The index of the chunk.
   * @param maxChunkSize The maximum size of a chunk in bytes.
   * @returns The chunk data as a Buffer.
   */
  public getChunk(index: number, maxChunkSize: number): Buffer {
    // Check if the cache is empty
    if (this.cache.length === 0) this.compress();

    // Calculate the start and end of the chunk
    const start = maxChunkSize * index;
    const end = Math.min(start + maxChunkSize, this.cache.byteLength);

    // Return the chunk data
    return this.cache.subarray(start, end);
  }

  /**
   * Get the SHA256 hash of the resource pack zip.
   * @returns The hash as a Buffer.
   */
  public generateHash(): Buffer {
    // Check if the cache is empty
    if (this.cache.length === 0) this.compress();

    // Create a hash of the compressed data
    return createHash("sha256").update(this.cache).digest();
  }

  public getSize(): number {
    // Check if the cache is empty
    if (this.cache.length === 0) this.compress();

    // Return the size of the compressed data
    return this.cache.byteLength;
  }

  public getDescriptor(): ResourcePackDescriptor {
    // Get the size of the compressed data
    const size = BigInt(this.compress().byteLength);

    // Create a new ResourcePackDescriptor instance
    const descriptor = new ResourcePackDescriptor(
      this.uuid,
      "",
      false,
      false,
      size,
      "",
      "",
      this.version,
      false,
      ""
    );

    // Return the descriptor
    return descriptor;
  }
}

export { ResourcePack };
