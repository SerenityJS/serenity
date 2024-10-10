import type { CompressionMethod } from "@serenityjs/protocol";

interface ServerProperties {
  port: number;
  address: string;
  compressionMethod: CompressionMethod;
  compressionThreshold: number;
  packetsPerFrame: number;
}

export { ServerProperties };
