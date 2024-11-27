import { existsSync, mkdirSync, readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { Logger, LoggerColors } from "@serenityjs/logger";

import {
  ResourceManifest,
  ResourcePackEntry,
  ResourcePacksProperties
} from "../types";

import { ResourcePack } from "./pack";
import { Zip } from "./zipfile";

// Utility function to read JSON files with comments
function readJsoncSync<T = unknown>(path: string): T {
  const data = readFileSync(path, "utf-8");

  const strippedData = data
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/g, ""))
    .join("\n");

  return JSON.parse(strippedData);
}

interface InstalledPack {
  id: string;
  manifest: ResourceManifest;
  subPack?: string;
  packPath: string;
}

const DefaultResourcePacksProperties: ResourcePacksProperties = {
  path: null,
  mustAcceptPacks: true,
  resourcePacks: []
};

class ResourcePackManager {
  private readonly resourcePacks = new Map<string, ResourcePack>();
  private readonly installedPacks = new Map<string, InstalledPack>();

  private readonly properties: ResourcePacksProperties;

  public readonly logger = new Logger("Resource Packs", LoggerColors.RedBright);

  public get mustAccept(): boolean {
    return this.properties.mustAcceptPacks;
  }

  public constructor(properties: Partial<ResourcePacksProperties>) {
    // Spread the properties
    const props = { ...DefaultResourcePacksProperties, ...properties };

    // Set the properties
    this.properties = props;

    // Check if a path was provided
    if (props.path) {
      // Check if the path doesn't exist
      if (!existsSync(resolve(props.path)))
        // Create the directory if it doesn't exist
        mkdirSync(resolve(props.path), { recursive: true });

      // Get all the directories in the resource packs folder
      const entries = readdirSync(resolve(props.path), {
        withFileTypes: true
      });

      // Filter out the directories
      const directories = entries.filter((entry) => entry.isDirectory());

      // Check if there are any directories
      if (directories.length === 0) {
        // Log that there are no resource packs
        this.logger.info("Currently no resource packs installed.");
      } else {
        // Attempt to read all the resource packs
        for (const entry of directories) {
          // Attempt to read the pack
          const pack = this.readPack(resolve(props.path, entry.name));

          // Check if the pack was read
          if (pack) {
            // Add the pack to the installed packs
            this.installedPacks.set(pack.manifest.header.uuid, pack);
          }
        }
      }
    }

    // Check if there are any resource packs
    if (props.resourcePacks.length > 0) {
      // Iterate over the resource packs
      for (const entry of props.resourcePacks) {
        // Attempt to read the pack from the path
        const pack = this.readPack(entry.path);

        // Check if the pack was read
        if (pack) {
          // Check if a sub-pack was provided
          if (entry.subPack) pack.subPack = entry.subPack;

          // Add the pack to the installed packs
          this.installedPacks.set(pack.manifest.header.uuid, pack);
        }
      }
    }

    // Load the selected packs
    this.loadSelectedPacks([...this.installedPacks.values()]);
  }

  public readPack(path: string): InstalledPack | null {
    // Get the manifest path
    const manifestPath = join(path, "manifest.json");

    // Prepare the manifest
    let manifest: ResourceManifest;
    try {
      // Read the manifest from the file
      manifest = readJsoncSync<ResourceManifest>(resolve(manifestPath));
    } catch (reason) {
      // Log the error
      this.logger.debug(
        `Error finding/reading manifest.json in resource pack folder: '${path}' - ${reason}`
      );

      // Return null
      return null;
    }

    // Return the installed pack
    return {
      manifest,
      packPath: path,
      id: manifest.header.uuid
    };
  }

  public loadSelectedPacks(selectedPacks: Array<InstalledPack>): void {
    for (const { id, subPack } of selectedPacks) {
      const installedPack = this.installedPacks.get(id);

      if (!installedPack) {
        this.logger.info(
          `Selected pack '${id}' is not installed; not enabling`
        );
        continue;
      }

      const packZip = new Zip(installedPack.packPath);

      const pack = new ResourcePack(
        id,
        installedPack.packPath,
        installedPack.manifest,
        packZip,
        subPack
      );
      pack.compress();

      this.resourcePacks.set(id, pack);
    }

    this.logger.info(
      `Successfully loaded ${this.resourcePacks.size} resource packs.`
    );
  }

  public getPacks(): Array<ResourcePack> {
    return [...this.resourcePacks.values()];
  }

  public getPack(uuid: string): ResourcePack | undefined {
    const isVersionUuid = uuid.includes("_");
    if (isVersionUuid) uuid = uuid.split("_")[0] as string;

    return this.resourcePacks.get(uuid);
  }

  /**
   * Adds a pack to the resource pack manager
   * @param entry The pack entry to add
   */
  public addPack(entry: ResourcePackEntry): void {
    // Read the pack from the path
    const pack = this.readPack(entry.path);

    if (!pack) {
      this.logger.error(`Failed to add pack from path: ${entry.path}`);
      return;
    }

    // Check if a sub-pack was provided
    if (entry.subPack) pack.subPack = entry.subPack;

    // Add the pack to the installed packs
    this.installedPacks.set(pack.manifest.header.uuid, pack);

    // Load the selected packs
    this.loadSelectedPacks([pack]);
  }

  public static fromPath(path: string): ResourcePackManager {
    return new ResourcePackManager({ path });
  }
}

export { ResourcePackManager };
