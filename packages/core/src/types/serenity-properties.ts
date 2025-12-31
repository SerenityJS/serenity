import { RaknetServerProperties } from "@serenityjs/raknet";

import { NetworkProperties } from "../network";
import { ResourcesProperties } from "../resources";

import { IPermissions } from "./permissions";

interface SerenityProperties {
  permissions: string | IPermissions | null;
  resources: string | Partial<ResourcesProperties>;
  movementValidation: boolean;
  movementHorizontalThreshold: number;
  movementVerticalThreshold: number;
  shutdownMessage: string;
  ticksPerSecond: number;
  debugLogging: boolean;
  offlineMode: boolean;
}

interface ServerProperties {
  serenity: Partial<SerenityProperties>;
  network: Partial<NetworkProperties>;
  raknet: Partial<RaknetServerProperties>;
  path: string | null;
}

export { SerenityProperties, ServerProperties };
