import { DimensionType } from "@serenityjs/protocol";

interface DimensionProperties {
  identifier: string;
  type: DimensionType;
  generator: string;
  viewDistance: number;
  simulationDistance: number;
  spawnPosition: [number, number, number];
}

export { DimensionProperties };
