import { PermissionEntry } from "../permissions";

import { ResourcePacksProperties } from "./resource";

import type { TerrainGenerator } from "../world";
import type { CompressionMethod } from "@serenityjs/protocol";

interface ServerProperties {
  path: string | null;
  port: number;
  address: string;
  motd: string;
  maxPlayers: number;

  compressionMethod: CompressionMethod;
  compressionThreshold: number;
  packetsPerFrame: number;

  permissions: string | Array<PermissionEntry>;

  resourcePacks: string | ResourcePacksProperties;

  defaultGenerator: typeof TerrainGenerator;

  debugLogging: boolean;
}

export { ServerProperties };
