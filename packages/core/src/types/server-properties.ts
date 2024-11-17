import { PermissionEntry } from "../permissions";

import { ResourcePacksProperties } from "./resource";

import type { TerrainGenerator } from "../world";
import type { CompressionMethod } from "@serenityjs/protocol";

interface ServerProperties {
  port: number;
  address: string;
  motd: string;

  compressionMethod: CompressionMethod;
  compressionThreshold: number;
  packetsPerFrame: number;

  permissions: string | Array<PermissionEntry>;

  resourcePacks: string | ResourcePacksProperties;

  defaultGenerator: typeof TerrainGenerator;

  debugLogging: boolean;
}

export { ServerProperties };
