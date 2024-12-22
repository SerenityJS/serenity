import { RaknetServerProperties } from "@serenityjs/raknet";

import { PermissionEntry } from "../permissions";
import { NetworkProperties } from "../network";

import { ResourcePacksProperties } from "./resource";

interface SerenityProperties {
  permissions: string | Array<PermissionEntry>;
  resourcePacks: string | ResourcePacksProperties;
  movementValidation: boolean;
  movementRewindThreshold: number;
  debugLogging: boolean;
}

interface ServerProperties {
  serenity: Partial<SerenityProperties>;
  network: Partial<NetworkProperties>;
  raknet: Partial<RaknetServerProperties>;
  path: string | null;
}

export { SerenityProperties, ServerProperties };
