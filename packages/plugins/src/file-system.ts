import {
  existsSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readdirSync
} from "fs";
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
  private validatePath(
    path: string,
    expectedType?: "file" | "directory"
  ): boolean {
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
        `Invalid path: ${path}. Path must be within the plugin's data directory.`
      );
      return false;
    }

    // Determine if the path is expected to be a file or directory
    const fileRegex = /.*\..+/; // Matches paths with a dot followed by one or more characters
    const hasExtension = fileRegex.test(path);
    if (
      (expectedType === "file" && !hasExtension) ||
      (expectedType === "directory" && hasExtension)
    ) {
      this.logger.warn(
        `Invalid path: ${path}. Path is not a valid ${expectedType}.`
      );
      return false;
    }

    return true;
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
    const isValid = this.validatePath(fullPath, "file");
    if (!isValid) return null;

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
    const isValid = this.validatePath(fullPath, "file");
    if (!isValid) return;

    // Ensure the directory for the file exists
    const dirPath = fullPath.substring(0, fullPath.lastIndexOf(sep));
    if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });

    // Write the file data
    return writeFileSync(fullPath, data);
  }

  /**
   * Removes a file from the plugin's data directory.
   * @param path The relative path to the file to remove.
   */
  public removeFile(path: string): void {
    // Check if the plugin data path exists
    if (!existsSync(this.dataPath)) return;

    // Resolve the full path to the file
    const fullPath = resolve(this.dataPath, path);

    // Validate the resolved path
    const isValid = this.validatePath(fullPath, "file");
    if (!isValid) return;

    // Check if the file exists
    if (!existsSync(fullPath)) return;

    // Remove the file
    return rmSync(fullPath);
  }

  /**
   * Creates a directory in the plugin's data directory.
   * @param path The relative path to the directory to create.
   * @returns The path of the created directory if successful, otherwise undefined.
   */
  public mkdir(path: string): string | undefined {
    // Check if the plugin data path exists
    if (!existsSync(this.dataPath))
      // If it doesn't, make the directory
      mkdirSync(this.dataPath, { recursive: true });

    // Resolve the full path to the directory
    const fullPath = resolve(this.dataPath, path);

    // Validate the resolved path
    const isValid = this.validatePath(fullPath);
    if (!isValid) return;

    // Make the directory
    return mkdirSync(fullPath, { recursive: true });
  }

  /**
   * Removes a directory from the plugin's data directory.
   * @param path The relative path to the directory to remove.
   * @param force Whether to forcefully remove the directory and its contents. Defaults to false.
   */
  public rmdir(
    path: string,
    options: { recursive: boolean; force: boolean } = {
      recursive: false,
      force: false
    }
  ): void {
    // Check if the plugin data path exists
    if (!existsSync(this.dataPath)) return;

    // Resolve the full path to the directory
    const fullPath = resolve(this.dataPath, path);

    // Validate the resolved path
    const isValid = this.validatePath(fullPath, "directory");
    if (!isValid) return;

    // Check if the directory exists
    if (!existsSync(fullPath)) return;

    // Remove the directory
    return rmSync(fullPath, options);
  }

  /**
   * Reads the contents of a directory in the plugin's data directory.
   * @param path The relative path to the directory to read.
   * @returns An array of file and directory names in the specified directory, or null if the directory does not exist or is invalid.
   */
  public readDir(path: string): Array<string> | null {
    // Ensure the plugin data directory exists
    if (!existsSync(this.dataPath)) return null;

    // Resolve the full path to the directory
    const fullPath = resolve(this.dataPath, path);

    // Validate the resolved path
    const isValid = this.validatePath(fullPath, "directory");
    if (!isValid) return null;

    // Check if the directory exists
    if (!existsSync(fullPath)) return null;

    // Read and return the directory contents
    return readdirSync(fullPath);
  }

  /**
   * Checks if a file or directory exists in the plugin's data directory.
   * @param path The relative path to the file or directory to check.
   * @returns True if the file or directory exists, otherwise false.
   */
  public exists(path: string): boolean {
    // Ensure the plugin data directory exists
    if (!existsSync(this.dataPath)) return false;

    // Resolve the full path to the file or directory
    const fullPath = resolve(this.dataPath, path);

    // Validate the resolved path
    const isValid = this.validatePath(fullPath);
    if (!isValid) return false;

    // Check if the file or directory exists
    return existsSync(fullPath);
  }
}

export { PluginFileSystem };
