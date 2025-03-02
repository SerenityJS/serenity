import { RaknetServerProperties } from "@serenityjs/raknet";

import { NetworkProperties } from "../network";

import { ResourcePacksProperties } from "./resource";
import { IPermissions } from "./permissions";

interface SerenityProperties {
  permissions: string | IPermissions | null;
  resourcePacks: string | ResourcePacksProperties;
  movementValidation: boolean;
  movementRewindThreshold: number;
  ticksPerSecond: number;
  debugLogging: boolean;
}

interface ServerProperties {
  serenity: Partial<SerenityProperties>;
  network: Partial<NetworkProperties>;
  raknet: Partial<RaknetServerProperties>;
  path: string | null;
}

export { SerenityProperties, ServerProperties };
