import { EntityEntry } from "../world";

interface EntityProperties {
  uniqueId: bigint;
  entry?: EntityEntry;
}

export { EntityProperties };
