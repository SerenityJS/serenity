import type { TerrainGenerator } from "../world";
import type { CompressionMethod } from "@serenityjs/protocol";

interface ServerProperties {
  port: number;
  address: string;
  compressionMethod: CompressionMethod;
  compressionThreshold: number;
  packetsPerFrame: number;
  defaultGenerator: typeof TerrainGenerator;
  debugLogging: boolean;
}

export { ServerProperties };
