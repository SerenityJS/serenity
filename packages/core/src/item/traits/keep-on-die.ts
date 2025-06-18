import { ByteTag } from "@serenityjs/nbt";

import { ItemStackTrait } from "./trait";

class ItemStackKeepOnDieTrait extends ItemStackTrait {
  public static readonly identifier = "keep_on_die";

  public get keep(): boolean {
    return this.item.nbt.has("minecraft:keep_on_death");
  }

  public set keep(value: boolean) {
    // Create a new ByteTag for the keep_on_death property
    const tag = new ByteTag(value ? 1 : 0, "minecraft:keep_on_death");

    // Set the keep_on_death tag in the item's NBT
    this.item.nbt.set("minecraft:keep_on_death", tag);
  }

  public onRemove(): void {
    this.item.nbt.delete("minecraft:keep_on_death");
  }
}

export { ItemStackKeepOnDieTrait };
