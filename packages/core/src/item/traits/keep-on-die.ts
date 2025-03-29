import { ByteTag } from "@serenityjs/nbt";

import { ItemIdentifier } from "../../enums";

import { ItemTrait } from "./trait";

class ItemKeepOnDieTrait<T extends ItemIdentifier> extends ItemTrait<T> {
  public static readonly identifier = "keep_on_die";

  public get keep(): boolean {
    return this.item.nbt.has("minecraft:keep_on_death");
  }

  /**
   * @deprecated Use `setKeep` instead. Errors will not propagate.
   */
  public set keep(value: boolean) {
    void this.setKeep(value);
  }

  public async setKeep(value: boolean): Promise<void> {
    if (value) {
      await this.item.nbt.add(
        new ByteTag({ name: "minecraft:keep_on_death", value: 1 })
      );
    } else {
      await this.item.nbt.delete("minecraft:keep_on_death");
    }
  }

  public async onRemove(): Promise<void> {
    await this.item.nbt.delete("minecraft:keep_on_death");
  }
}

export { ItemKeepOnDieTrait };
