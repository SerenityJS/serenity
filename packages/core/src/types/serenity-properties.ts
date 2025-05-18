import { RaknetServerProperties } from "@serenityjs/raknet";

import { NetworkProperties } from "../network";
import { ResourcesProperties } from "../resources";

import { IPermissions } from "./permissions";

interface SerenityProperties {
  permissions: string | IPermissions | null;
  resources: string | ResourcesProperties;
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
