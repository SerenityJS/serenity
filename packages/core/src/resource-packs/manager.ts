import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { ResourceManifest } from "../types";
import { ResourcePack } from "./pack";
import { join } from "path";
import { Zip } from "./zipfile";
import { Logger, LoggerColors } from "@serenityjs/logger";

// Utility function to read JSON files with comments
function readJsoncSync<T = any>(path: string): T {
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
  packPath: string;
}

interface SelectedPack {
  id: string;
  subpack?: string;
}

class ResourcePackManager {
  private readonly resourcePacks = new Map<string, ResourcePack>();
  private readonly installedPacks = new Map<string, InstalledPack>();

  public readonly logger = new Logger("Resource Packs", LoggerColors.RedBright);

  public constructor(
    public readonly packsFolder: string,
    public readonly mustAccept: boolean,
  ) {
    if (!existsSync(this.packsFolder)) {
      mkdirSync(this.packsFolder, { recursive: true });
    } else if (!statSync(this.packsFolder).isDirectory()) {
      this.logger.error(
        "The provided resource pack folder path already exists and is not a directory.",
      );
      return;
    }

    this.getInstalledPacks();

    const selectedPacksPath = join(this.packsFolder, "selected_packs.json");
    const selectedPacks = new Array<SelectedPack>();
    if (existsSync(selectedPacksPath)) {
      // Load the selected packs file
      selectedPacks.push(...readJsoncSync<SelectedPack[]>(selectedPacksPath));
    } else if (this.installedPacks.size === 0) {
      // If no resource packs are installed, and there is no selected_packs.json file, then just return
      this.logger.info("Currently no resource packs installed.");
      return;
    } else {
      // If there is no selected_packs.json file, then read all available
      // packs and select all of them. Then write selected_packs.json
      const installed = Array.from(this.installedPacks.keys()).map((id) => ({
        id,
      }));

      this.logger.info(
        `selected_packs.json file not found; Selecting all ${installed.length} installed packs by default.`,
      );

      selectedPacks.push(...installed);

      writeFileSync(selectedPacksPath, JSON.stringify(selectedPacks, null, 2));
    }

    this.loadSelectedPacks(selectedPacks);
  }

  /** Reads all resource packs in the packs folder */
  public getInstalledPacks() {
    const folders = readdirSync(this.packsFolder);

    for (const folder of folders) {
      const packPath = join(this.packsFolder, folder);

      if (!statSync(packPath).isDirectory()) continue;

      const manifestPath = join(packPath, "manifest.json");

      let manifest: ResourceManifest;
      try {
        manifest = readJsoncSync<ResourceManifest>(manifestPath);
      } catch (e) {
        // fail to read manifest, skip this folder
        this.logger.info(
          `Failed to find/read manifest.json in folder '${folder}' - skipping.`,
        );
        this.logger.debug(
          `Error finding/reading manifest.json in resource pack folder: '${folder}' - ${e.message}`,
        );
        continue;
      }

      this.installedPacks.set(manifest.header.uuid, {
        manifest,
        packPath,
        id: manifest.header.uuid,
      });
    }
  }

  public loadSelectedPacks(selectedPacks: Array<SelectedPack>): void {
    for (const { id, subpack } of selectedPacks) {
      const installedPack = this.installedPacks.get(id);

      if (!installedPack) {
        this.logger.info(
          `Selected pack '${id}' is not installed; not enabling`,
        );
        continue;
      }

      const packZip = new Zip(installedPack.packPath);

      const pack = new ResourcePack(
        id,
        installedPack.packPath,
        installedPack.manifest,
        packZip,
        subpack,
      );
      pack.compress();

      this.resourcePacks.set(id, pack);
    }
  }

  public getPacks(): Array<ResourcePack> {
    return [...this.resourcePacks.values()];
  }

  public getPack(uuid: string): ResourcePack | undefined {
    const isVersionUuid = uuid.includes("_");
    if (isVersionUuid) uuid = uuid.split("_")[0] as string;

    return this.resourcePacks.get(uuid);
  }
}

export { ResourcePackManager };
