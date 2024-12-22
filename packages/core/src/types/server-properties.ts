import { RaknetServerProperties } from "@serenityjs/raknet";

import { PermissionEntry } from "../permissions";
import { NetworkProperties } from "../network";

import { ResourcePacksProperties } from "./resource";

import type { TerrainGenerator } from "../world";

interface ServerProperties {
  network?: Partial<NetworkProperties>;
  raknet?: Partial<RaknetServerProperties>;

  path: string | null;

  permissions: string | Array<PermissionEntry>;

  resourcePacks: string | ResourcePacksProperties;

  defaultGenerator: typeof TerrainGenerator;

  debugLogging: boolean;
}

export { ServerProperties };
