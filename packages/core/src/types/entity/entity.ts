import { CompoundTag } from "@serenityjs/nbt";

interface EntityProperties {
  uniqueId: bigint;
  storage?: CompoundTag;
}

export { EntityProperties };
