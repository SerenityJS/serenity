import { ByteTag } from "@serenityjs/nbt";

import { ItemTrait } from "./trait";

class ItemKeepOnDieTrait extends ItemTrait {
  public static readonly identifier = "keep_on_die";

  public get keep(): boolean {
    return this.item.nbt.has("minecraft:keep_on_death");
  }

  public set keep(value: boolean) {
    if (value) {
      this.item.nbt.add(
        new ByteTag({ name: "minecraft:keep_on_death", value: 1 })
      );
    } else {
      this.item.nbt.delete("minecraft:keep_on_death");
    }
  }

  public onRemove(): void {
    this.item.nbt.delete("minecraft:keep_on_death");
  }
}

export { ItemKeepOnDieTrait };
