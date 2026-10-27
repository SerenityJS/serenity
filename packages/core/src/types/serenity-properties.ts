import { NetherNetServerProperties } from "@serenityjs/nethernet";

import { NetworkProperties } from "../network";
import { ResourcesProperties } from "../resources";

import { IPermissions } from "./permissions";

interface SerenityProperties {
  permissions: string | IPermissions | null;
  resources: string | Partial<ResourcesProperties>;
  spawnWorldIdentifier: "default";
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
  nethernet: Partial<NetherNetServerProperties>;

  /**
   * The properties of the removed RakNet transport, read from older properties files.
   * Its address, port, message and max connections are carried over to NetherNet.
   * @deprecated Use `nethernet` instead.
   */
  raknet?: Partial<
    Pick<
      NetherNetServerProperties,
      "address" | "port" | "message" | "maxConnections"
    >
  >;

  path: string | null;
}

export { SerenityProperties, ServerProperties };
