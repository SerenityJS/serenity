import { CompoundTag } from "@serenityjs/nbt";

class ItemTypeVanillaProperties extends CompoundTag<unknown> {
  public constructor() {
    super({ name: "components" });
  }
}

export { ItemTypeVanillaProperties };
