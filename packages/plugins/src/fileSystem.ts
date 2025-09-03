import { existsSync, readFileSync, mkdirSync, writeFileSync } from "fs";
import { resolve, sep, isAbsolute } from "path";

import { Logger } from "@serenityjs/logger";

class PluginFileSystem {
  /**
   * The path to the plugin's data directory.
   */
  public readonly dataPath: string;

  /**
   * The logger instance for the plugin.
   */
  private readonly logger: Logger;

  /**
   * Creates an instance of the PluginFileSystem class.
   * @param dataPath The path to the plugin's data directory.
   */
  public constructor(dataPath: string, logger: Logger) {
    this.dataPath = dataPath;
    this.logger = logger;
  }

  /**
   * Validates the given path.
   * @param path The path to validate.
   * @returns True if the path is valid, otherwise false.
   */
  private validatePath(path: string): boolean {
    // Ensure the path is absolute
    if (!isAbsolute(path)) {
      this.logger.warn(
        `Attempted to access invalid path: ${path}. Path must be absolute.`
      );
      return false;
    }

    // Ensure the path is within the plugin's data directory
    if (!path.startsWith(this.dataPath + sep)) {
      this.logger.warn(
        `Attempted to access invalid path: ${path}. Path must be within the plugin's data directory.`
      );
      return false;
    }

    return true;
  }

  /**
   * Checks if a file exists in the plugin's data directory.
   * @param path The path to the file to check.
   * @returns True if the file exists, otherwise false.
   */
  public hasFile(path: string): boolean {
    // Check if the plugin data path exists
    if (!existsSync(this.dataPath)) return false;

    // Resolve the full path to the file
    const fullPath = resolve(this.dataPath, path);

    // Validate the resolved path
    const isValid = this.validatePath(fullPath);
    if (!isValid) return false;

    // Check if the file exists
    return existsSync(fullPath);
  }

  /**
   * Reads a file from the plugin's data directory.
   * @param path The relative path to the file to read.
   * @param encoding Optional encoding. If provided, returns a string; otherwise, returns a Buffer.
   * @returns The file data if it exists and is valid, otherwise null.
   */
  public readFile(path: string): Buffer | null;
  public readFile(path: string, encoding: BufferEncoding): string | null;
  public readFile(
    path: string,
    encoding?: BufferEncoding
  ): Buffer | string | null {
    // Ensure the plugin data directory exists
    if (!existsSync(this.dataPath)) return null;

    // Resolve the full path to the file
    const fullPath = resolve(this.dataPath, path);

    // Validate the resolved path
    if (!this.validatePath(fullPath)) return null;

    // Check if the file exists
    if (!existsSync(fullPath)) return null;

    // Read and return the file data
    return readFileSync(fullPath, encoding);
  }

  /**
   * Writes data to a file in the plugin's data directory.
   * @param path The relative path to the file to write.
   * @param data The data to write to the file.
   * @returns
   */
  public writeFile(path: string, data: Buffer | string): void {
    // Check if the plugin data path exists
    if (!existsSync(this.dataPath))
      // If it doesn't, make the directory
      mkdirSync(this.dataPath, { recursive: true });

    // Resolve the full path to the file
    const fullPath = resolve(this.dataPath, path);

    // Validate the resolved path
    const isValid = this.validatePath(fullPath);
    if (!isValid) return;

    // Write the file data
    return writeFileSync(fullPath, data);
  }
}

export { PluginFileSystem };
