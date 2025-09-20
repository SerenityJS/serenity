import { resolve } from "node:path";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";

import { unzipSync } from "fflate";
import { ResourcePackDescriptor } from "@serenityjs/protocol";

import { ResourceManifest } from "..";

import { ResourcePack } from "./pack";

interface ResourceEntry {
  path: string;
  subPack?: string;
}

interface ResourcesProperties {
  path?: string;
  mustAccept: boolean;
  resources?: Array<ResourceEntry>;
  chunkDownloadTimeout: number;
  chunkMaxSize: number;
}

const DefaultResourcesProperties: ResourcesProperties = {
  path: "./resource_packs",
  mustAccept: true,
  chunkDownloadTimeout: 1,
  chunkMaxSize: 1024 * 256
};

type FileMap<T = Buffer> = Record<string, T>;

class Resources {
  /**
   * The properties of the resources.
   */
  public readonly properties: ResourcesProperties;

  /**
   * The current resource packs installed on the server.
   */
  public readonly packs = new Map<string, ResourcePack>();

  public constructor(properties?: Partial<ResourcesProperties>) {
    // Assign the default properties and the provided properties
    this.properties = { ...DefaultResourcesProperties, ...properties };

    // Check if a path to the resources was provided
    if (this.properties.path) {
      // Check if the path directory exists
      if (!existsSync(resolve(this.properties.path))) {
        // Create the directory if it doesn't exist
        mkdirSync(resolve(this.properties.path), { recursive: true });
      }

      // Read the contents within the directory path
      const entries = readdirSync(resolve(this.properties.path), {
        withFileTypes: true
      });

      // Filter to only include directories
      const directories = entries.filter((entry) => entry.isDirectory());

      for (const entry of directories) {
        // Attempt to read the pack
        try {
          const pack = this.readPack(resolve(this.properties.path, entry.name));

          // Add the pack to the list of packs
          this.packs.set(pack.uuid, pack);
        } catch (reason) {
          // Log the error if the pack could not be read
          console.error(
            `Failed to read resource pack at ${entry.name}`,
            reason
          );
        }
      }
    }
  }

  /**
   * Load a resource pack from a given path.
   * @param path The path to the resource pack.
   * @returns The loaded ResourcePack instance.
   */
  public loadFromPath(path: string): ResourcePack {
    // Read the pack from the provided path
    const pack = this.readPack(path);

    // Check if the pack is already loaded
    if (this.packs.has(pack.uuid))
      throw new Error(
        `The resource pack with the UUID ${pack.uuid} is already loaded.`
      );

    // Add the pack to the list of packs
    this.packs.set(pack.uuid, pack);

    // Return the pack
    return pack;
  }

  /**
   * Load a resource pack from a zip buffer.
   * @param buffer The zip buffer containing the resource pack.
   * @returns The loaded ResourcePack instance.
   */
  public loadFromZip(buffer: Buffer): ResourcePack {
    // Unzip the buffer into a file tree
    const fileTree = unzipSync(buffer) as FileMap<Uint8Array>;

    // Check if the manifest file exists in the file tree
    if (!fileTree["manifest.json"]) {
      // Throw an error if the manifest file is missing
      throw new Error(
        `The provided zip does not contain a manifest.json file.`
      );
    }

    // Parse the manifest file
    const manifest = JSON.parse(
      new TextDecoder().decode(fileTree["manifest.json"])
    ) as ResourceManifest;

    // Prepare the file tree for the resource pack
    const resourceFileTree: FileMap<Buffer | FileMap> = {};

    // Populate the resource file tree
    for (const [key, value] of Object.entries(fileTree)) {
      resourceFileTree[key] = Buffer.from(value);
    }

    // Create a new resource pack instance
    const pack = new ResourcePack("in-memory", manifest, resourceFileTree);

    // Check if the pack is already loaded
    if (this.packs.has(pack.uuid))
      throw new Error(
        `The resource pack with the UUID ${pack.uuid} is already loaded.`
      );

    // Add the pack to the list of packs
    this.packs.set(pack.uuid, pack);

    // Return the pack
    return pack;
  }

  private readPack(path: string): ResourcePack {
    // Check if the pack contains a manifest file
    if (!existsSync(resolve(path, "manifest.json")))
      throw new Error(
        `The pack at ${path} does not contain a manifest.json file.`
      );

    // Read the pack manifest file
    const manifest = JSON.parse(
      readFileSync(resolve(path, "manifest.json"), "utf-8")
    ) as ResourceManifest;

    // Prepare the file tree
    const fileTree: FileMap<Buffer | FileMap> = {};

    // Create a recursive function to walk through the directory
    const walk = (dir: string) => {
      // Read the contents of the directory
      const entries = readdirSync(dir, { withFileTypes: true });

      // Iterate through each entry in the directory
      for (const entry of entries) {
        const fullPath = resolve(dir, entry.name);

        // Check if the entry is a directory or a file
        if (entry.isDirectory()) {
          // Recursively walk through subdirectories
          walk(fullPath);
        } else {
          // Read the file and store its content in the file tree
          const content = readFileSync(fullPath);

          // Get the relative path of the file
          const relativePath = fullPath
            .replace(path + "\\", "")
            .replace(/\\/g, "/") // Windows compatibility
            .replace(path + "/", ""); // Unix compatibility

          // Assign the content to the file tree
          fileTree[relativePath] = content;
        }
      }
    };

    // Start walking the directory
    walk(path);

    // Create & return a new resource pack instance
    return new ResourcePack(path, manifest, fileTree);
  }

  /**
   * Get all resource pack descriptors.
   * @returns An array of ResourcePackDescriptor instances.
   */
  public getAllPackDescriptors(): Array<ResourcePackDescriptor> {
    // Map the resource packs to the ResourcePackDescriptor
    return [...this.packs.values()].map((pack) => pack.getDescriptor());
  }
}

export {
  Resources,
  type ResourcesProperties,
  type FileMap,
  DefaultResourcesProperties
};
